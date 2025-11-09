import mongoose from "mongoose";

import { OnModelEnum, IComment } from "../../Common";

const commentSchema = new mongoose.Schema<IComment>({
    content: String,
    attachments: [String],
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    refId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'onModel',
        required: true
    },
    onModel: {
        type: String,
        enum: OnModelEnum,
        required: true
    }
})

export const CommentModel = mongoose.model<IComment>('Comment', commentSchema);