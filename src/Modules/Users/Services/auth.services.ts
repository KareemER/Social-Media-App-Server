import { Request, Response } from "express";
import { IUser, OtpTypesEnum } from "../../../Common";
import { UserRepository } from "../../../DB/Repositories/user.repository";
import { UserModel } from "../../../DB/Models";
import { encrypt, generatHash, localEmitter } from "../../../Utils";


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
            OTPS:[confirmationOtp]
        })

        return res.status(201).json({ message: 'User created successfully', data: { newUser } })
    }
}

export default new AuthService()