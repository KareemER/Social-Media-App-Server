import { Router } from "express";

import profileServices from "../Services/profile.services";
import { authenticationMiddleware, Multer } from "../../../Middlewares";

const profileController = Router();

// upload profile picture
profileController.post('/upload-profile-picture',authenticationMiddleware, Multer().single('profilePicture'), profileServices.uploadProfilePicture);

// renew signed url
profileController.post('/renew-signed-url',authenticationMiddleware, profileServices.renewSignedUrl);

// delete account
profileController.delete('/delete-account',authenticationMiddleware, profileServices.deleteAccount);

export { profileController };