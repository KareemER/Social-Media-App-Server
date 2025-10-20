import { Router } from "express";

import authServices from "../Services/auth.services";
import { authenticationMiddleware } from "../../../Middlewares";

const authController = Router();

// Sign Up
authController.post('/signUp', authServices.SignUp);

// Confirm email
authController.post('/confirmEmail', authServices.ConfirmEmailService);

// Sign In
authController.post('/signIn', authServices.SignIn);

// Log out
authController.post('/logOut', authenticationMiddleware, authServices.LogOut)

export { authController };