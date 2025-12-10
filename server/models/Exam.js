import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const ExamSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        exam_name: {
            type: String,
            required: true
        },
        exam_short_name: {
            type: String,
        },
        upcoming_exam_date: {
            type: String,
        },
        result_date: {
            type: String,
        },
        application_form_date: {
            type: String,
        },
        youtube_link: {
            type: String,
        },
        application_form_link: {
            type: String,
        },
        exam_form_link: {
            type: String,
        },
        exam_mode: {
            type: mongoose.Schema.Types.ObjectId,
        },
        slug: {
            type: String,
        },
        image: {
            type: Array,
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            default: "Pending",
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Exam = regularDatabase.model("Exam", ExamSchema);

export default Exam;
