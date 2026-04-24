import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Leads Database URL
export const db = mongoose.createConnection(process.env.MONGO_URI);

// Server Database URL
export const connectDB = async () => {
    await mongoose.connect(process.env.CAMPUSAIM_MONGO_URI); // SAME as server
};