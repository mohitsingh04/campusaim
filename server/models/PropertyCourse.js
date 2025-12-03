import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const PropertyCourseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
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
    prices: {
      type: Object,
    },
    status: {
      type: String,
      default: "Active",
    },
  },
  { timestamps: true }
);

const PropertyCourse = regularDatabase.model(
  "PropertyCourse",
  PropertyCourseSchema
);

export default PropertyCourse;
