import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const permissionsSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true, // e.g. lead.create
            trim: true,
            lowercase: true,
        },

        module: {
            type: String,
            required: true, // lead, user, report
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 300,
        },

        isSystem: {
            type: Boolean,
            default: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const Permission = db.model("Permission", permissionsSchema);
export default Permission;