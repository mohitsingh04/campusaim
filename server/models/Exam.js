import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const ExamSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    exam_name: {
      type: String,
      required: true,
    },
    exam_short_name: {
      type: String,
    },
    exam_type: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    exam_tag: {
      type: [mongoose.Schema.Types.ObjectId],
    },
    upcoming_exam_date: {
      type: {
        date: { type: Date },
        is_tentative: { type: Boolean, default: false },
      },
    },
    result_date: {
      type: {
        date: { type: Date },
        is_tentative: { type: Boolean, default: false },
      },
    },
    application_form_date: {
      type: {
        start: { type: Date },
        end: { type: Date },
        is_tentative: { type: Boolean, default: false },
      },
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
    answer_sheet: {
      type: String,
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
    faqs: {
      type: [{ question: { type: String }, answer: { type: String } }],
    },
  },
  { timestamps: true },
);

const Exam = regularDatabase.model("Exam", ExamSchema);

export default Exam;
