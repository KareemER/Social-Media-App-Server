import mongoose, { Types } from "mongoose";

import { ConversationTypeEnum, IConverstion } from "../../Common";

const converstionSchema = new mongoose.Schema<IConverstion>({
    type: {
        type: String,
        enum: Object.values(ConversationTypeEnum),
        default: ConversationTypeEnum.DIRECT
    },
    name: String,
    members: [{ type: Types.ObjectId, ref: 'User' }]
})

export const converstionModel = mongoose.model<IConverstion>('Converstions', converstionSchema);