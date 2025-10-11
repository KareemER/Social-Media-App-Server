import { Router } from "express";
import authServices from "../Services/auth.services";
const authController = Router()

// Sign Up
authController.post('/signUp', authServices.SignUp)






export { authController }