import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const CourseEligibilitySchema = mongoose.Schema(
  {
    course_eligibility: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const CourseEligibility = regularDatabase.model(
  "course_eligibility",
  CourseEligibilitySchema,
);

export default CourseEligibility;
