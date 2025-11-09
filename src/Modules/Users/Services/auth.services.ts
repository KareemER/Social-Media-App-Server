import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { SignOptions } from "jsonwebtoken";

import { IRequest, IUser, OtpTypesEnum } from "../../../Common";
import { BlackListedTokenRepository, UserRepository } from "../../../DB/Repositories";
import { BlackListedTokenModel, UserModel } from "../../../DB/Models";
import { compareHash, ConflictException, generateToken, generateHash, localEmitter, SuccessResponse } from "../../../Utils";

class AuthService {

    private userRepo: UserRepository = new UserRepository(UserModel);
    private blackListedTokenRepo: BlackListedTokenRepository = new BlackListedTokenRepository(BlackListedTokenModel)
    
    /**
    * ===================================
    * @API post /api/auth/signUp
    * ===================================
    * @description : creates a user locally on our code
    * 
    */

    SignUp = async (req: Request, res: Response) => {
        const { firstName, lastName, email, password, gender, dateOfBirth, phoneNumber }: Partial<IUser> = req.body;

        // checks the existence of the email
        const isEmailExists = await this.userRepo.findOneDocument({ email }, 'email');
        if (isEmailExists) throw new ConflictException('Email already exists.', { invalidEmail: email });

        // // Encypting Phone Number
        // const encryptedPhoneNumber = encrypt(phoneNumber as string);

        // // Hashing User's Password
        // const hashedPassword = generateHash(password as string);

        // Sending OTP
        const otp = Math.floor(Math.random() * 1000000).toString();
        localEmitter.emit('sendEmail', {
            to: email,
            subject: 'OTP for SignUp',
            content: `Your OTP is ${otp}`
        })
        const confirmationOtp = {
            value: generateHash(otp),
            expiresAt: Date.now() + 6000000,
            otpType: OtpTypesEnum.CONFIRMATION
        }

        // creating a new user instance 
        const newUser = await this.userRepo.createNewDocument({
            firstName,
            lastName,
            email,
            password,
            gender,
            dateOfBirth,
            phoneNumber,
            OTPS: [confirmationOtp]
        })

        return res.status(201).json(SuccessResponse<IUser>("User created successfully", 201, newUser));
    }

    /**
    * ===================================
    * @API post /api/auth/confirmEmail
    * ===================================
    * @description : confirms user's email
    * 
    */

    ConfirmEmailService = async (req: Request, res: Response) => {
        const { email, otp } = req.body;

        //Searching for user
        const user: IUser | null = await this.userRepo.findOneDocument({ email, isVerified: false });
        if (!user) return res.status(401).json({ message: 'Your credentials are not correct' });

        //Searching for user's OTP
        let userOtp = user.OTPS?.find((otp) => otp.otpType == OtpTypesEnum.CONFIRMATION);

        //Checking if the OTP is valid
        const isOtpMatched = compareHash(otp, userOtp?.value as string);
        if (!isOtpMatched) return res.status(400).json({ message: "Invalid OTP" });

        //Checking if the OTP has expired
        if (userOtp?.expiresAt as number < Date.now()) return res.status(400).json({ message: "OTP has expired" });

        //Updating user's isVerified and OTPS
        user.isVerified = true;
        user.OTPS = user.OTPS?.filter((otp) => otp.otpType != OtpTypesEnum.CONFIRMATION);

        //updating user in database
        await user.save();
        return res.status(200).json({ message: "Confirmed" });
    }

    /**
    * ===================================
    * @API post /api/auth/signIn
    * ===================================
    * @description : Logs a user in
    * 
    */

    SignIn = async (req: Request, res: Response) => {
        const { email, password } = req.body;

        //Searching for user
        const user: IUser | null = await this.userRepo.findOneDocument({ email });
        if (!user) return res.status(401).json({ message: 'Your credentials are not correct' });

        //Checking if the password is correct
        const isPasswordMatched = compareHash(password, user.password);
        if (!isPasswordMatched) return res.status(401).json({ message: 'Your credentials are not correct' });

        //Generating access token
        const accessToken = generateToken(
            {
                _id: user._id,
                email: user.email,
                provider: user.provider,
                role: user.role
            },
            process.env.JWT_ACCESS_SECRET as string,
            {
                expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
                jwtid: uuidv4()
            }
        );

        //Generating refresh token
        const refreshToken = generateToken(
            {
                _id: user._id,
                email: user.email,
                provider: user.provider,
                role: user.role
            },
            process.env.JWT_REFRESH_SECRET as string,
            {
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
                jwtid: uuidv4()
            }
        );

        return res.status(200).json({ message: 'User Logged in successfully', data: { tokens: { accessToken, refreshToken } } });
    }

    /**
    * ===================================
    * @API post /api/auth/logOut
    * ===================================
    * @description : Logs a user out
    * 
    */

    LogOut = async (req: Request, res: Response) => {
        const { token: { jti, exp } } = (req as unknown as IRequest).loggedInUser;

        // Adding the used token to the black list
        const blackListedToken = await this.blackListedTokenRepo.createNewDocument({ tokenId: jti, expiresAt: new Date(exp || Date.now() + 600000) })

        return res.status(200).json({ message: 'User Logged Out Successfully', data: { blackListedToken } })
    }
}

export default new AuthService();