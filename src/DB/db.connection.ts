import mongoose from "mongoose";

export async function dbConnection() {
    try {
        await mongoose.connect(process.env.DB_URL_Local as string)
        console.log("Database connected");
    } catch (error) {
        console.log("Database connection failure", error);
    }
}