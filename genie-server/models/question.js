import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const OptionSchema = new mongoose.Schema(
    {
        value: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^[a-z0-9_]+$/, "Invalid option value format"],
            maxlength: 100,
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
            enum: ["CONTINUE", "STOP_CONVERSATION", "JUMP", "END"],
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

const QuestionSchema = new mongoose.Schema(
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
            minlength: 3,
            maxlength: 200,
        },

        questionText: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 500,
        },

        status: {
            type: String,
            enum: ["active", "inactive", "pending"],
            default: "active",
        },

        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^[a-z0-9-]+$/, "Invalid slug format"],
        },

        options: {
            type: [OptionSchema],
            validate: {
                validator: (opts) => Array.isArray(opts) && opts.length >= 2,
                message: "At least 2 options are required",
            },
            default: [],
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Question = db.models.Question || db.model("Question", QuestionSchema);
export default Question;