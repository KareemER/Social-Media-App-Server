import { EventEmitter } from "node:events"
import { IEmailArguments } from "../../Common"
import nodemailer from 'nodemailer'

export const sendEmail = async (
    {
        to,
        cc,
        subject,
        content,
        attachments = []
    }: IEmailArguments
) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        service: 'gmail',
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASSWORD
        }
    })

    const info = await transporter.sendMail({
        from: `No-Reply <${process.env.USER_EMAIL}>`,
        to,
        cc,
        subject,
        html: content,
        attachments
    })

    return info
}

export const localEmitter = new EventEmitter()

localEmitter.on(`sendEmail`, (args: IEmailArguments) => {
    sendEmail(args)
})