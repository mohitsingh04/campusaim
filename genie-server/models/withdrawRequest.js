import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const WithdrawRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    earnings: [{
        type: mongoose.Schema.Types.ObjectId,
        refPath: "earningModel" // 🔥 dynamic
    }],

    earningModel: {
        type: String,
        enum: ["IncentiveEarning", "ComissionEarning"],
        required: true
    },

    totalAmount: {
        type: Number,
        required: true
    },

    reason: {
        type: String,
        default: null
    },

    type: {
        type: String,
        enum: ["incentive", "commission"],
        required: true
    },

    status: {
        type: String,
        enum: ["processing", "approved", "rejected"],
        default: "processing"
    },

    requestedAt: {
        type: Date,
        default: Date.now
    },
    processedAt: {
        type: Date
    }
}, { timestamps: true });

const WithdrawRequest = db.model("WithdrawRequest", WithdrawRequestSchema);
export default WithdrawRequest;