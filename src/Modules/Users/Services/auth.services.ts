import { NextFunction, Request, Response } from "express";
import { IUser } from "../../../Common";
import { UserRepository } from "../../../DB/Repositories/user.repository";
import { UserModel } from "../../../DB/Models";


class AuthService {

    private userRepo: UserRepository = new UserRepository(UserModel)

    /**
    * ===================================
    * @API post /api/auth/signUp
    * ===================================
    * @description : creates a user locally on our code
    * 
    */

    SignUp = async (req: Request, res: Response, next: NextFunction) => {
        const { firstName, lastName, email, password, gender, dateOfBirth, phoneNumber }: Partial<IUser> = req.body

        // checks the existence of the email
        const isEmailExists = await this.userRepo.findOneDocument({ email }, 'email')
        if (isEmailExists) return res.status(409).json({ message: 'Email already exists.', data: { invalidEmail: email } })

        // creating a new user instance 
        const newUser = await this.userRepo.createNewDocument({
            firstName,
            lastName,
            email,
            password,
            gender,
            dateOfBirth,
            phoneNumber
        })

        return res.status(201).json({message:'User created successfully', data:{newUser}})
    }
}

export default new AuthService()