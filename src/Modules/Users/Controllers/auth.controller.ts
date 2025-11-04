import { Router } from "express";

import authServices from "../Services/auth.services";
import { authenticationMiddleware } from "../../../Middlewares";
import { validationMiddleware } from "../../../Middlewares";
import { SignUpValidator, SignInValidator    } from "../../../Validators";

const authController = Router();

// Sign Up
authController.post('/signUp', validationMiddleware(SignUpValidator), authServices.SignUp);

// Confirm email
authController.post('/confirmEmail', authServices.ConfirmEmailService);

// Sign In
authController.post('/signIn',validationMiddleware(SignInValidator), authServices.SignIn);

// Log out
authController.post('/logOut', authenticationMiddleware, authServices.LogOut)

export { authController };