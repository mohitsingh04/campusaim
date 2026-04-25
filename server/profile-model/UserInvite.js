import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const userInviteSchema = new mongoose.Schema({
    role: { type: mongoose.Schema.Types.ObjectId, ref: "role", required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "RegularUser", required: true, },
}, { timestamps: true });

const UserInvite = profileDatabase.model("UserInvite", userInviteSchema);
export default UserInvite;