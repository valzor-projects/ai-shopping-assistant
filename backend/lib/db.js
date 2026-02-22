import mongoose from "mongoose";
import { ENV } from "./env.js";

// Connect to MongoDB using the URI from env
export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(ENV.MONGO_DB_URI);
        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};