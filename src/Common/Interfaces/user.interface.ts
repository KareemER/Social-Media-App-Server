import { Document, Types } from "mongoose";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

import { FriendShipStatusEnum, GenderEnum, OtpTypesEnum, ProviderEnum, RolesEnum } from "..";

interface IOTP {
    value: string;
    expiresAt: number;
    otpType: OtpTypesEnum;
}

interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: RolesEnum;
    gender: GenderEnum;
    dateOfBirth?: Date;
    profilePicture?: string;
    coverPicture?: string;
    provider: ProviderEnum;
    googleId?: string;
    isVerified: boolean;
    phoneNumber?: string;
    OTPS?: IOTP[];
}

interface IEmailArguments {
    to: string;
    cc?: string;
    subject: string;
    content: string;
    attachments?: [];
}

interface IRequest extends Request {
    loggedInUser: { user: IUser, token: JwtPayload };
}

interface IBlackListedToken extends Document {
    tokenId: string,
    expiresAt: Date
}

interface IFriendShip extends Document{
    requestFromId: Types.ObjectId;
    requestToId: Types.ObjectId;
    status: FriendShipStatusEnum;
}

export { IUser, IEmailArguments, IRequest, IBlackListedToken, IFriendShip };