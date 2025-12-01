import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const PropertyCourseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    uniqueId: {
      type: Number,
    },
    course_type: {
      type: mongoose.Schema.Types.ObjectId,
    },
    course_short_name: {
      type: String,
    },
    certification_type: {
      type: mongoose.Schema.Types.ObjectId,
    },
    prices: {
      type: Object,
    },
    course_level: {
      type: mongoose.Schema.Types.ObjectId,
    },
    duration: {
      type: String,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    status: {
      type: String,
      default: "Active",
    },
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    requirements: {
      type: [mongoose.Schema.Types.ObjectId],
    },
    cerification_info: {
      type: Boolean,
    },
    best_for: {
      type: Array,
    },
    languages: {
      type: Array,
    },
    key_outcomes: {
      type: [mongoose.Schema.Types.ObjectId],
    },
    course_format: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

const PropertyCourse = regularDatabase.model(
  "PropertyCourse",
  PropertyCourseSchema
);

export default PropertyCourse;
