import { Types } from "mongoose";

export interface IConverstion {
    _id?: Types.ObjectId;
    type: string;
    name?: string;
    members: Types.ObjectId[];
}

export interface IMessage extends Document {
    text?: string
    converstionId: Types.ObjectId
    senderId: Types.ObjectId
    attachments?: string[]
}