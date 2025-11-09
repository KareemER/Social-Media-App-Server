import { Document, Types } from "mongoose";

interface IComment extends Document<Types.ObjectId> {
    content: string;
    ownerId: Types.ObjectId;
    attachments: string[];
    refId: Types.ObjectId;
    onModel: string;
}

export { IComment };