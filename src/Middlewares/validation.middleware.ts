import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { BadRequestException } from "../Utils";


type RequestKeyType = keyof Request;
type SchemaType = Partial<Record<RequestKeyType, ZodType>>;
type ValidationErrorType = {
    key: RequestKeyType;
    issues: {
        path: PropertyKey[];
        message: string
    }[]
}



export const validationMiddleware = (schema: SchemaType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const reqKeys: RequestKeyType[] = ['body', 'params', 'query', 'headers']


        const validationError:ValidationErrorType[] = []
        for (const key of reqKeys) {
            if(schema[key]) {
                const result = schema[key].safeParse(req[key])
                if(!result?.success) {
                    const issues = result.error.issues.map(issue => ({
                        path: issue.path,
                        message: issue.message
                    }))
                    validationError.push({ key, issues })
                }
            }
        }

        if(validationError.length) throw new BadRequestException('Validation failed', {validationError});
        next();
    }
}