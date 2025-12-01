import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const CourseSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
    },
    uniqueId: {
      type: Number,
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
    stream: {
      type: mongoose.Schema.Types.ObjectId,
    },
    duration: {
      type: String,
    },
    description: {
      type: String,
    },
    property_id: {
      type: Number,
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
    certification_type: {
      type: mongoose.Schema.Types.ObjectId,
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
