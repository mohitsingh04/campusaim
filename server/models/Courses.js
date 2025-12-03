import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const CourseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    course_name: {
      type: String,
    },
    course_short_name: {
      type: String,
    },
    specialization: {
      type: mongoose.Schema.Types.ObjectId,
    },
    duration: {
      type: String,
    },
    course_type: {
      type: mongoose.Schema.Types.ObjectId,
    },
    program_type: {
      type: mongoose.Schema.Types.ObjectId,
    },
    best_for: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    }],
    course_eligibility: {
      type: String,
    },
    description: {
      type: String,
    },
    course_slug: {
      type: String,
    },
    image: {
      type: Array,
    },
    status: {
      type: String,
      default: "Active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Course = regularDatabase.model("Course", CourseSchema);

export default Course;
