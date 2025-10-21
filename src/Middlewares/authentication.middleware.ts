import { Request, NextFunction, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

import { verifyToken } from "../Utils";
import { IRequest, IUser } from "../Common";
import { BlackListedTokenRepository, UserRepository } from "../DB/Repositories";
import { BlackListedTokenModel, UserModel } from "../DB/Models";

const userRepo = new UserRepository(UserModel);
const blackListedTokenRepo = new BlackListedTokenRepository(BlackListedTokenModel);

export const authenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { authentication: accessToken } = req.headers;

    // Checking wherther there is a token or not
    if (!accessToken) return res.status(401).json({ message: 'Please Login first' });

    // Adding a type guard that converts the header to a string
    const tokenString = Array.isArray(accessToken) ? accessToken[0] : accessToken;

    // Checking the prefix and spliting it from the token
    const [prefix, token] = tokenString.split(' ');
    if (prefix !== process.env.JWT_PREFIX) return res.status(401).json({ message: 'Invalid Token' });

    // Decoding Data and checking its availability
    const decodedData = verifyToken(token, process.env.JWT_ACCESS_SECRET);
    if (!decodedData._id) return res.status(401).json({ message: "Invalid payload" });

    //Checking wherther the token is black listed or not
    const blacklistedToken = await blackListedTokenRepo.findOneDocument({ tokenId: decodedData.jti });
    if (blacklistedToken) return res.status(401).json({ message: 'Your session is expired' });

    // finding and checking user's existence by id
    const user: IUser | null = await userRepo.findDocumentById(decodedData._id, '-password');
    if (!user) return res.status(404).json({ message: 'Please register first' });

    // Adding user's data and token to the request to use it later on the module services
    (req as unknown as IRequest).loggedInUser = { user, token: decodedData as JwtPayload };

    return next();
}