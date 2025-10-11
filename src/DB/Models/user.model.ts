import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RolesEnum, IUser } from "../../Common";


const userSchema = new mongoose.Schema<IUser>(
    {
        firstName: {
            type: String,
            required: true,
            minLength: [4, "first name must contain more than 3 letters"]
        },
        lastName: {
            type: String,
            required: true,
            minLength: [4, "Last name must contain more than 3 letters"]
        },
        email: {
            type: String,
            required: true,
            index: {
                unique: true,
                name: 'idx_email_unique'
            }
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: RolesEnum,
            default: RolesEnum.USER
        },
        gender: {
            type: String,
            enum: GenderEnum,
            default: GenderEnum.RATHER_NOT_SAY
        },
        dateOfBirth: Date,
        profilePicture: String,
        coverPicture: String,
        provider: {
            type: String,
            enum: ProviderEnum,
            default: ProviderEnum.LOCAL
        },
        googleId: String,
        isVerified: {
            type: Boolean,
            default: false
        },
        phoneNumber: String
    }
)

const UserModel = mongoose.model<IUser>('User', userSchema)
export { UserModel }
