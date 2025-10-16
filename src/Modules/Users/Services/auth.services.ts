import { Request, Response } from "express";
import { IUser, OtpTypesEnum } from "../../../Common";
import { UserRepository } from "../../../DB/Repositories/user.repository";
import { UserModel } from "../../../DB/Models";
import { compareHash, encrypt, generateToken, generatHash, localEmitter } from "../../../Utils";
import { SignOptions } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

class AuthService {

    private userRepo: UserRepository = new UserRepository(UserModel)

    /**
    * ===================================
    * @API post /api/auth/signUp
    * ===================================
    * @description : creates a user locally on our code
    * 
    */

    SignUp = async (req: Request, res: Response) => {
        const { firstName, lastName, email, password, gender, dateOfBirth, phoneNumber }: Partial<IUser> = req.body

        // checks the existence of the email
        const isEmailExists = await this.userRepo.findOneDocument({ email }, 'email')
        if (isEmailExists) return res.status(409).json({ message: 'Email already exists.', data: { invalidEmail: email } })

        // Encypting Phone Number
        const encryptedPhoneNumber = encrypt(phoneNumber as string)

        // Hashing User's Password
        const hashedPassword = generatHash(password as string)

        // Sending OTP
        const otp = Math.floor(Math.random() * 1000000).toString()
        localEmitter.emit('sendEmail', {
            to: email,
            subject: 'OTP for SignUp',
            content: `Your OTP is ${otp}`
        })
        const confirmationOtp = {
            value: generatHash(otp),
            expiresAt: Date.now() + 6000000,
            otpType: OtpTypesEnum.CONFIRMATION
        }

        // creating a new user instance 
        const newUser = await this.userRepo.createNewDocument({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            gender,
            dateOfBirth,
            phoneNumber: encryptedPhoneNumber,
            OTPS: [confirmationOtp]
        })

        return res.status(201).json({ message: 'User created successfully', data: { newUser } })
    }

    /**
    * ===================================
    * @API post /api/auth/confirmEmail
    * ===================================
    * @description : confirms user's email
    * 
    */

    confirmEmailService = async (req: Request, res: Response) => {
        const { email, otp } = req.body

        //Searching for user
        const user: IUser | null = await this.userRepo.findOneDocument({ email, isVerified: false })
        if (!user) return res.status(401).json({ message: 'Your credentials are not correct' })

        //Searching for user's OTP
        let userOtp = user.OTPS?.find((otp) => otp.otpType == OtpTypesEnum.CONFIRMATION)

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
        const { email, password } = req.body

        //Searching for user
        const user: IUser | null = await this.userRepo.findOneDocument({ email })
        if (!user) return res.status(401).json({ message: 'Your credentials are not correct' })

        //Checking if the password is correct
        const isPasswordMatched = compareHash(password, user.password)
        if (!isPasswordMatched) return res.status(401).json({ message: 'Your credentials are not correct' })

        //Generating access token
        const accessToken = generateToken(
            {
                id: user._id,
                email: user.email,
                provider: user.provider,
                role: user.role
            },
            process.env.JWT_ACCESS_SECRET as string,
            {
                expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
                jwtid: uuidv4()
            }
        )

        //Generating refresh token
        const refreshToken = generateToken(
            {
                id: user._id,
                email: user.email,
                provider: user.provider,
                role: user.role
            },
            process.env.JWT_REFRESH_SECRET as string,
            {
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
                jwtid: uuidv4()
            }
        )
        return res.status(200).json({ message: 'User Logged in successfully', data: { tokens: { accessToken, refreshToken } } })
    }
}

export default new AuthService()