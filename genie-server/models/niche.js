import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const nicheSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        status: {
            type: String,
            default: "active"
        },
    },
    { timestamps: true }
);

const Niche = db.model("niche", nicheSchema);
export default Niche;