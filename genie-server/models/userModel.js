import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const userSchema = new mongoose.Schema({
    nicheId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "niche",
        default: null,
    },

    name: {
        type: String,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    contact: {
        type: String,
        unique: true,
        sparse: true,
        match: [/^[0-9]{10}$/, "Please enter a valid 10-digit contact number"],
    },

    ref_code: {
        type: String,
        unique: true,
        sparse: true,
        default: undefined
    },

    password: {
        type: String,
        required: function () {
            return this.provider === "local";
        },
        minlength: 6,
        select: false,
    },

    profile_image: {
        type: String,
    },

    profile_image_compressed: {
        type: String,
    },

    bio: {
        type: String,
        maxlength: 500,
    },

    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },

    provider: {
        type: String,
        enum: ["local", "google", "hybrid"], // ✅ add hybrid
        default: "local",
    },

    status: {
        type: String,
        enum: ["active", "suspended"],
        default: "active",
    },

    isVerified: {
        type: Boolean,
        default: false, // true = Verified, false = Unverified
    },

    role: {
        type: String,
        enum: ["superadmin", "admin", "partner", "counselor", "teamleader"],
        default: "admin", // because admin can create partner and counselor, and superadmin can change roles and permission
    },

    teamLeader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    permission: {
        type: [String],
        default: [],
    },

    verifyToken: {
        type: String,
        select: false,
    },

    verifyTokenExpiry: {
        type: Date,
    },

    forgotOrResetPasswordToken: {
        type: String,
        select: false,
    },

    forgotOrResetPasswordTokenExpiry: {
        type: Date,
    },

    totalActiveSeconds: {
        type: Number, // to track counselor's active time, only for counselor
        default: 0,
    },

    lastLoginAt: {
        type: Date,
        default: null,
    },

    activityLogs: [
        {
            at: {
                type: Date,
                default: Date.now,
            },
            seconds: {
                type: Number,
                required: true,
            },
        },
    ],
}, { timestamps: true });

const User = db.models.User || db.model("User", userSchema);
export default User;