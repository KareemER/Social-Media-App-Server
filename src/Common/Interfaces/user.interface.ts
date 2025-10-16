import { Document } from "mongoose";
import { GenderEnum, OtpTypesEnum, ProviderEnum, RolesEnum } from "..";

interface IOTP {
    value: string,
    expiresAt: number,
    otpType: OtpTypesEnum
}

interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: RolesEnum;
    gender: GenderEnum;
    dateOfBirth?: Date;
    profilePicture?: string,
    coverPicture?: string,
    provider: ProviderEnum,
    googleId?: string,
    isVerified: boolean;
    phoneNumber?: string;
    OTPS?: IOTP[]
}

interface IEmailArguments {
    to: string,
    cc?: string,
    subject: string,
    content: string,
    attachments?: [];
}

export { IUser, IEmailArguments }