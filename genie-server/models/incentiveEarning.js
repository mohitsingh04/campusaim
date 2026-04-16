import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const IncentiveEarningSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead",
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ["global", "course-wise"],
    },
    leadSnapshot: {
        name: String,
        contact: String,
    },
    incentiveSnapshot: {
        type: {
            type: String,
            enum: ["global", "course-wise"],
        },
        globalAmount: Number,
        courseAmount: Number,
    },
    status: {
        type: String,
        enum: ["earned", "processing", "paid"],
        default: "earned"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const IncentiveEarning = db.model("IncentiveEarning", IncentiveEarningSchema);
export default IncentiveEarning;