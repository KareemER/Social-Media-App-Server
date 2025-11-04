import { Request, Response } from "express";

import { UserModel } from "../../../DB/Models";
import { UserRepository } from "../../../DB/Repositories";
import { BadRequestException, S3ClientService, SuccessResponse } from "../../../Utils";
import { IRequest } from "../../../Common";
import mongoose from "mongoose";

class ProfileServices {

    private userRepo: UserRepository = new UserRepository(UserModel);
    private s3Client = new S3ClientService();

    /**
    * ===================================
    * @API post /api/profile/upload-profile-picture
    * ===================================
    * @description : upload profile picture from a logged in user
    * @param {file} file
    * @returns {Promise<void>}
    */

    uploadProfilePicture = async (req: Request, res: Response) => {
        const { file } = req;
        const { user } = (req as unknown as IRequest).loggedInUser;

        // check if file is uploaded
        if (!file) throw new BadRequestException('No file uploaded');

        // upload file to s3
        const { key, signedUrl } = await this.s3Client.uploadFileOnS3(file, `/${user._id}/profile-pictures`);

        // update user profile picture
        user.profilePicture = key;
        await user.save();

        res.json(SuccessResponse<unknown>('Profile picture uploaded successfully', 200, { profilePicture: { key, signedUrl } }))
    }

    /**
    * ===================================
    * @API post /api/profile/renew-signed-url
    * ===================================
    * @description : renew signed url from a logged in user
    * @param {string} key
    * @param {string} keyType
    * @returns {Promise<void>}
    */

    renewSignedUrl = async (req: Request, res: Response) => {
        const { user } = (req as unknown as IRequest).loggedInUser;
        const { key, keyType }: {key: string, keyType: 'profilePicture' | 'coverPicture' } = req.body;

        // check if key is valid
        if (user[keyType] !== key) throw new BadRequestException('Invalid key');
        
        // create signed url
        const signedUrl = await this.s3Client.getFileWithSignedUrl(key);
        
        res.json(SuccessResponse<unknown>('Signed URL renewed successfully', 200, { key, signedUrl }))
    }

    /**
    * ===================================
    * @API delete /api/profile/delete-account
    * ===================================
    * @description : delete account from a logged in user
    * @returns {Promise<void>}
    */

    deleteAccount = async (req: Request, res: Response) => {
        const { user  } = (req as unknown as IRequest).loggedInUser;
        
        // delete user from database
        const deletedUser = await this.userRepo.deleteOneDocumentById(user._id as mongoose.Schema.Types.ObjectId);

        // check if user is not found
        if (!deletedUser) throw new BadRequestException('User not found');
        
        // delete user's profile picture from s3
        const deletedResponse = await this.s3Client.deleteFileFromS3(deletedUser?.profilePicture as string);

        res.json(SuccessResponse<unknown>('Account deleted successfully', 200, deletedResponse))
    }
}

export default new ProfileServices();