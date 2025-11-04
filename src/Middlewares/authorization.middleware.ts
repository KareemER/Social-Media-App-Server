import { NextFunction, Request, Response } from "express";
import { IRequest } from "../Common";

export const authorization = (allowdRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction)=>{
        const {user:{role}} = (req as IRequest).loggedInUser;
        
        if(allowdRoles.includes(role)){
            return next()
        }
        res.status(401).json({message: "Unauthorized"})
    }
}