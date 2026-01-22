import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const CourseEligibilitySchema = mongoose.Schema(
    {
        uniqueId: {
            type: Number,
            required: true,
        },
        course_eligibility: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const CourseEligibility = regularDatabase.model("course_eligibility", CourseEligibilitySchema);

export default CourseEligibility;