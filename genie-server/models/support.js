import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const supportSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
        email: { type: String, required: true, trim: true, lowercase: true },
        category: {
            type: String,
            enum: ["general", "technical", "billing", "account", "feature"],
            default: "general",
        },
        subject: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
        message: { type: String, required: true, trim: true, minlength: 10 },
        status: {
            type: String,
            enum: ["open", "in_progress", "resolved", "closed"],
            default: "open",
        },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

const Support = db.model('Support', supportSchema);
export default Support;