export class HttpException extends Error {
    constructor(public message: string, public statusCode: number, public errors?: object) {
        super();
        Object.setPrototypeOf(this, new.target.prototype);
    }
}