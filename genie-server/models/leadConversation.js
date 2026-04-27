import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const QuestionSchema = new mongoose.Schema(
    {
        question_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Question",
        },
        answer: {
            type: String,
            trim: true,
        },
        point: {
            type: Number,
        },
    },
    { _id: false }
);

const ConversationSessionSchema = new mongoose.Schema(
    {
        // 🔥 WHO made this conversation
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "superadmin", "agent", "teamleader", "counselor", "partner", "system"],
            required: true,
        },

        questions: {
            type: [QuestionSchema],
            validate: {
                validator: function (arr) {
                    const ids = arr.map(q => q.question_id.toString());
                    return ids.length === new Set(ids).size;
                },
                message: "Duplicate questions detected",
            },
        },

        rating: { type: Number, default: 0 },
        status: { type: String, default: "open" },
        message: { type: String },

        // Fixed
        next_follow_up_date: { type: Date, default: null },
        next_follow_up_time: { type: String, trim: true },

        // Follow-up tracking
        follow_up_completed: {
            type: Boolean,
            default: false,
        },

        follow_up_completed_at: {
            type: Date,
            default: null,
        },

        // who scheduled the follow-up
        follow_up_created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },

        // who completed the follow-up
        follow_up_completed_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },

        overallAnswerScore: { type: Number, default: 0 },
        systemLeadScore: { type: Number, default: 0 },
        counselorConfidenceScore: { type: Number, default: 0 },
        overallLeadScore: { type: Number, default: 0 },

        pitchSummary: {
            type: String,
            trim: true,
            maxlength: 1500, // short strategic summary
        },

        callNotes: {
            type: String,
            trim: true,
            maxlength: 5000, // detailed notes of conversation
        },

        studentObjections: {
            type: [String],
            default: [], // e.g. ["Fees high", "Wants govt college"]
        },

        collegesSuggested: {
            type: [String],
            default: [], // ["DIT Dehradun", "Graphic Era"]
        },

        courseSuggested: {
            type: [String],
            default: []
        },

        nextAction: {
            type: String,
            enum: ["call_again", "send_whatsapp", "schedule_visit", "closed"],
            default: "call_again",
        },

        scoreExplanation: {
            type: [
                {
                    type: { type: String },
                    text: String
                }
            ],
            default: []
        },

        submitQuestion: {
            type: {
                submitted: Number,
                total: Number,
            },
        },
    },
    { timestamps: true }
);

const LeadConversationSchema = new mongoose.Schema(
    {
        lead_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
        },

        // 🔥 Full history instead of overwrite
        sessions: [ConversationSessionSchema],
    },
    { timestamps: true }
);

const LeadConversation = db.model(
    "LeadConversation",
    LeadConversationSchema
);

export default LeadConversation;