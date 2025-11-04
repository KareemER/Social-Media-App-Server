import z from 'zod'
import { GenderEnum, RolesEnum } from '../../Common'


export const SignUpValidator = {
    body: z.strictObject({
        firstName: z.string().min(4, {error: 'First name must be at least 4 characters long'}),
        lastName: z.string().min(4, {error: 'Last name must be at least 4 characters long'}),
        email: z.email(),
        password: z.string().min(8, {error: 'Password must be at least 8 characters long'}).max(59),
        passwordConfirmation: z.string(),
        gender: z.enum(GenderEnum),
        // age: z.number().min(16).max(80),
        role: z.enum(RolesEnum),
        DOB: z.coerce.date(),
        phoneNumber: z.string().min(11).max(11)
    })
    .refine(
        (data) => {
            if(data.password !== data.passwordConfirmation) return false
            return true
        },
        {path: ['passwordConfirmation'], message: 'Passwords do not match'}
    )
}

export const SignInValidator = {
    body: z.strictObject({
        email: z.email(),
        password: z.string()
    })
}

export const ForgetPasswordValidator = {
    body: z.strictObject({
        email: z.email()
    })
}

export const ResetPasswordValidator = {
    body: z.strictObject({
        email: z.email(),
        otp: z.string().min(5).max(5),
        newPassword: z.string().min(6).max(59),
        confirmNewPassword: z.string(),
    })
    .refine(
        (data) => {
            if(data.newPassword !== data.confirmNewPassword) return false
            return true
        },
        {path: ['confirmNewPassword'], message: 'Passwords do not match'}
    )
}

export const UpdatePasswordValidator = {
    body: z.strictObject({
        oldPassword: z.string(),
        newPassword: z.string().min(6).max(59),
        confirmNewPassword: z.string()

    })
    .refine(
        (data) => {
            if(data.newPassword !== data.confirmNewPassword) return false
            return true
        },
        {path: ['confirmNewPassword'], message: 'Passwords do not match'}
    )
}