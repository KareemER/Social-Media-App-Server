import express, { NextFunction, Request, Response } from "express";

import 'dotenv/config'

import { dbConnection } from "./DB/db.connection";
import * as controllers from './Modules/controllers.index';
import { FailedResponse, HttpException } from "./Utils";

const app = express();


app.use(express.json());

dbConnection();

app.use('/api/auth', controllers.authController);
app.use('/api/profile', controllers.profileController);
// app.use('/api/posts')
// app.use('/api/comments')
// app.use('/api/reacts')

// Error handling middleware
app.use((err: HttpException | Error | null, req: Request, res: Response, next: NextFunction) => {
    if (err) {
        if (err instanceof HttpException) {
            res.status(err.statusCode).json(FailedResponse(err.message, err.statusCode, err.errors));
        } else {
            res.status(500).json(FailedResponse('Something went wrong', 500, err))
            console.log(err);
        }
    }
})

const port: number | string = process.env.PORT || "5000"
app.listen(port, () => {
    console.log("server is running on port:", process.env.PORT);

})