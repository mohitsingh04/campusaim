import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const userInviteSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            default: null,
        },
        role: {
            type: String,
            enum: ["partner"],
            required: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const UserInvite = db.model('UserInvite', userInviteSchema);
export default UserInvite;