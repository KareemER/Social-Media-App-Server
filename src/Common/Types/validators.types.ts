import z from 'zod'
import { SignInValidator, SignUpValidator, UpdatePasswordValidator } from '../../Validators'



export type SignUpBodyType = z.infer<typeof SignUpValidator.body>
export type SignInBodyType = z.infer<typeof SignInValidator.body>
export type UpdatePasswordBodyType = z.infer<typeof UpdatePasswordValidator.body>