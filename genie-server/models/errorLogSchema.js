import mongoose from "mongoose";
import { db } from '../mongoose/index.js';

const errorLogSchema = new mongoose.Schema(
    {
        message: {
            type: String,
            required: true,
            trim: true,
        },
        stack: {
            type: String,
            default: null,
        },
        page: {
            type: String,
            required: true,
        },
        method: {
            type: String,
            enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            default: null,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        userRole: {
            type: String,
            default: null,
        },
        browser: {
            type: String,
            default: null,
        },
        device: {
            type: String,
            default: null,
        },
        ip: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const ErrorLog = db.model('ErrorLog', errorLogSchema);
export default ErrorLog;