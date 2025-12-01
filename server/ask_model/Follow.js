import mongoose from "mongoose";
import { askDatabase } from "../database/Databases.js";

const followSchema = new mongoose.Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    followingType: {
        type: String,
        enum: ["User", "Category", "Question"],
        required: true,
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "followingType"
    },
}, { timestamps: true });

// Optional: Prevent duplicate follows
followSchema.index({ follower: 1, followingType: 1, following: 1 }, { unique: true });

const Follow = askDatabase.model("Follow", followSchema);
export default Follow;