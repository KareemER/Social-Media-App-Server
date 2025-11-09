import mongoose from "mongoose";

import { IMessage } from "../../Common";


const messageSchema = new mongoose.Schema({
    text: String,
    converstionId: {
        type: mongoose.Types.ObjectId,
        ref: 'Converstions',
        required: true
    },
    senderId: {
        type: mongoose.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    attachments: [String],
})

export const MessageModel = mongoose.model<IMessage>('Messages', messageSchema);