// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// // Leads Database URL
// export const db = mongoose.createConnection(process.env.MONGO_URI);

// // Server Database URL
// export const connectDB = async () => {
//     await mongoose.connect(process.env.CAMPUSAIM_MONGO_URI); // SAME as server
// };

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// ✅ ENV validation
if (!process.env.MONGO_URI || !process.env.CAMPUSAIM_MONGO_URI) {
    throw new Error("Missing database environment variables");
}

// ✅ External DB (Genie)
export const db = mongoose.createConnection(process.env.MONGO_URI);

// ✅ Wrap external DB connection in promise (IMPORTANT)
export const connectGenieDB = async () => {
    try {
        // ✅ wait until connection is ready
        if (db.readyState === 1) {
            console.log("Genie DB already connected");
            return;
        }

        await new Promise((resolve, reject) => {
            db.once("open", resolve);
            db.on("error", reject);
        });

        console.log("Genie DB connected");

    } catch (err) {
        console.error("Genie DB error:", err);
        throw err;
    }
};

// ✅ Main DB (CampusAim)
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.CAMPUSAIM_MONGO_URI);

        console.log("CampusAim Main DB connected");
    } catch (err) {
        console.error("Main DB error:", err);
        process.exit(1);
    }
};