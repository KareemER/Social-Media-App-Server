import { Router } from "express";
import authServices from "../Services/auth.services";
const authController = Router()

// Sign Up
authController.post('/signUp', authServices.SignUp)

// confirm email
authController.post('/confirmEmail', authServices.confirmEmailService)

// Sign In
authController.post('/signIn', authServices.SignIn)



export { authController }