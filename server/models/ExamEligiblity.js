import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const ExamEligibilitySchema = new mongoose.Schema(
  {
    exam_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Exam",
    },
    min_age: {
      type: {
        year: { type: Number },
        month: { type: Number },
      },
    },
    max_age: {
      type: {
        year: { type: Number },
        month: { type: Number },
      },
    },
    std_class: {
      type: String,
    },
    pursuing_class: {
      type: Boolean,
    },
    percentage: {
      type: Object,
    },
    streams: {
      type: [mongoose.Schema.Types.ObjectId],
    },
  },
  { timestamps: true },
);

const ExamEligibility = regularDatabase.model(
  "Exam-eligibility",
  ExamEligibilitySchema,
);

export default ExamEligibility;
