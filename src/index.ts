import express, { NextFunction, Request, Response } from "express";
import 'dotenv/config'
import { dbConnection } from "./DB/db.connection";
import * as controllers from './Modules/controllers.index'
const app = express();


app.use(express.json());

dbConnection();

app.use('/api/auth', controllers.authController);
// app.use('/api/users')
// app.use('/api/posts')
// app.use('/api/comments')
// app.use('/api/reacts')

// Error handling middleware
app.use((err: Error | null, req: Request, res: Response, next: NextFunction) => {
    const status = 500;
    const message = "Something went wrong";
    res.status(status).json({ message: err?.message || message });
})

const port: number | string = process.env.PORT || 5000
app.listen(port, () => {
    console.log("server is running on port:", process.env.PORT);

})