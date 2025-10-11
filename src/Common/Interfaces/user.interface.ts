import { Document } from "mongoose";
import { GenderEnum, ProviderEnum, RolesEnum } from "..";


interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: RolesEnum;
    gender: GenderEnum;
    dateOfBirth?: Date;
    profilePicture?: String,
    coverPicture?: String,
    provider: ProviderEnum,
    googleId?: String,
    isVerified: Boolean;
    phoneNumber?: String;
}

export { IUser }