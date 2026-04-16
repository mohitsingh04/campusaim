import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const ProgressLogSchema = new mongoose.Schema({
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    count: { type: Number, default: 0 }
});

const GoalSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organization",
        default: null,
    },

    counselorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    goalType: {
        type: String,
        enum: [
            "applications_done",
            "admissions_done"
        ],
        required: true
    },

    goalPeriod: {
        type: String,
        enum: ["monthly", "custom"],
        required: true
    },

    targetValue: {
        type: Number,
        required: true,
        min: 1
    },

    currentValue: {
        type: Number,
        default: 0,
        min: 0
    },

    progressLogs: [ProgressLogSchema],

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ["not_started", "active", "completed", "expired"],
        default: "not_started"
    }

}, { timestamps: true });

const Goal = db.model("Goal", GoalSchema);

GoalSchema.pre("save", async function (next) {
    try {
        // ---------------- DATE VALIDATION ----------------
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);

        if (start >= end) {
            return next(new Error("Start date must be before end date"));
        }

        // ---------------- OVERLAP CHECK ----------------
        if (this.isNew) {
            const existing = await this.constructor.findOne({
                organizationId: this.organizationId, // ✅ FIX
                counselorId: this.counselorId,
                goalType: this.goalType,
                status: "active",
                startDate: { $lte: end },
                endDate: { $gte: start }
            });

            if (existing) {
                return next(new Error("Active goal already exists for this period"));
            }
        }

        next();

    } catch (err) {
        next(err);
    }
});

export default Goal;