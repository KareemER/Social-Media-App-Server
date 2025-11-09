import express, { NextFunction, Request, Response } from "express";
import cors from 'cors'
import 'dotenv/config'
import morgan from 'morgan'

import { dbConnection } from "./DB/db.connection";
import * as controllers from './Modules/controllers.index';
import { FailedResponse, HttpException } from "./Utils";
import { ioIntializer } from './Gateways/socketIo.gateway'

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

dbConnection();

app.use('/api/auth', controllers.authController);
app.use('/api/profile', controllers.profileController);
app.use('/api/posts', controllers.postsController);
// app.use('/api/comments', controllers.commentController);
// app.use('/api/reacts', controllers.reactController);

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
const server = app.listen(port, () => {
    console.log("server is running on port:", process.env.PORT);
})

ioIntializer(server)
