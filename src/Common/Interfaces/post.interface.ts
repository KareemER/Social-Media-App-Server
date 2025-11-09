import { Document, Types } from "mongoose";


interface IPost extends Document<Types.ObjectId> {
    description?: string;
    attachments?: string[];
    ownerId: Types.ObjectId;
    allowComments?: boolean;
    tags?: Types.ObjectId[];
}


export { IPost };