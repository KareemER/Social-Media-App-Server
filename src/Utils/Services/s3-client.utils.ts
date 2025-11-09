import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs, { ReadStream } from "node:fs";

interface IPutObjectCommandInput extends PutObjectCommandInput {
    Body: string | Buffer | ReadStream;
}

export class S3ClientService {
    private s3Client = new S3Client({
        region: process.env.AWS_REGION as string,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
        }
    })

    private key_folder = process.env.AWS_KEY_FOLDER as string;

    async getFileWithSignedUrl(key: string, expiresIn = 60) {
        const getCommand = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME as string,
            Key: key
        })
        return await getSignedUrl(this.s3Client, getCommand, { expiresIn })
    }

    async uploadFileOnS3(file: Express.Multer.File, key: string) {
        // Creating Key-name for the file
        const keyName = `${this.key_folder}/${key}/${Date.now()}-${file.originalname}`

        const uploadParams: IPutObjectCommandInput = {
            Bucket: process.env.AWS_BUCKET_NAME as string,
            Key: keyName,
            Body: fs.createReadStream(file.path),
            ContentType: file.mimetype,
            // ACL: "public-read"
        }

        // Uploading the file
        const putCommand = new PutObjectCommand(uploadParams)

        // Executing the command
        await this.s3Client.send(putCommand)

        // Getting the signed URL
        const signedUrl = await this.getFileWithSignedUrl(keyName)
        return {
            key: keyName,
            signedUrl
        }
    }
    
    async UploadFilesOnS3(files: Express.Multer.File[], key: string) {
        const keys = files.map(file => this.uploadFileOnS3(file, key))
        return await Promise.all(keys)
    }

    async deleteFileFromS3(key: string) {
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME as string,
            Key: key
        })
        return await this.s3Client.send(deleteCommand)
    }

    async deleteBulkFromS3(keys: string[]) {
        const deleteCommand = new DeleteObjectsCommand({
            Bucket: process.env.AWS_BUCKET_NAME as string,
            Delete: {
                Objects: keys.map(key => ({ Key: key }))
            }
        })
        return await this.s3Client.send(deleteCommand)
    }
}

// specify the required command
// send => execute this command