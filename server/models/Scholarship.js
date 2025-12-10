import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const ScholarshipSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        scholarship_title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        scholarship_type: {
            type: mongoose.Schema.Types.ObjectId,
        },

        scholarship_description: {
            type: String,
            required: true,
        },

        start_date: {
            type: Date,
        },

        end_date: {
            type: Date,
        },

        age_criteria: {
            min: { type: Number },
            max: { type: Number },
        },

        marks: {
            min: { type: Number, min: 0, max: 100 },
            max: { type: Number, min: 0, max: 100 },
        },

        qualification: {
            type: String,
            trim: true,
        },

        card: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        }],

        gender: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        }],

        cast: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        }],

        religion: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        }],

        entrance_exam: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        }],

        scholarship_amount: {
            type: Map,
            of: Number,
            default: {},
        },

        annual_income: {
            type: Map,
            of: Number,
            default: {},
        },

        location: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        }],

        scholarship_link: {
            type: String,
            trim: true,
        },

        sports_quotas: {
            type: Boolean,
            default: false,
        },

        army_quota: {
            type: Boolean,
        },

        scholarship_exam: {
            type: Boolean,
            default: false,
        },

        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },

        status: {
            type: String,
            default: "Active",
        },
    },
    { timestamps: true }
);

const Scholarship = regularDatabase.model("Scholarship", ScholarshipSchema);

export default Scholarship;
