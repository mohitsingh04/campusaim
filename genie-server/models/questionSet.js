import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const QuestionOptionSchema = new mongoose.Schema(
    {
        value: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^[a-z0-9_]+$/, "Invalid option value format"],
        },
        label: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        point: {
            type: Number,
            default: 0,
            min: -100,
            max: 100,
        },
        action: {
            type: String,
            enum: ["CONTINUE", "STOP_CONVERSATION", "JUMP", "END", "CAPTURE_TEXT"],
            default: "CONTINUE",
        },
        jumpTo: {
            type: Number,
            validate: {
                validator: function (val) {
                    return this.action !== "JUMP" || Number.isInteger(val);
                },
                message: "jumpTo is required when action is JUMP",
            },
        },
    },
    { _id: false }
);

const QuestionSetSchema = new mongoose.Schema(
    {
        nicheId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "niche",
            required: true,
        },
        order: {
            type: Number,
            required: true,
            min: 1,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        questionText: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            match: [/^[a-z0-9-]+$/, "Invalid slug format"],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isActive: {
            type: String,
            enum: ["active", "inactive", "pending"],
            default: "active",
        },
        options: {
            type: [QuestionOptionSchema],
            validate: {
                validator: (opts) => Array.isArray(opts) && opts.length >= 2,
                message: "At least 2 options are required",
            },
            default: [],
        },
    },
    { timestamps: true }
);

QuestionSetSchema.index({ nicheId: 1, order: 1 }, { unique: true });

const QuestionSet = db.models.QuestionSet || db.model("QuestionSet", QuestionSetSchema);
export default QuestionSet;
