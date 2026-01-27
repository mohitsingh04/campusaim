import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const specializationFeeSchema = new mongoose.Schema(
  {
    specialization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    fees: {
      tuition_fee: {
        type: Number,
        required: true,
        min: 0,
      },
      registration_fee: {
        type: Number,
        default: 0,
        min: 0,
      },
      exam_fee: {
        type: Number,
        default: 0,
        min: 0,
      },
      currency: {
        type: String,
        default: "INR",
        uppercase: true,
      },
    },
  },
  { _id: false }
);

const PropertyCourseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    course_short_name: {
      type: String,
      trim: true,
    },

    duration: {
      type: String,
    },

    course_type: {
      type: mongoose.Schema.Types.ObjectId,
    },

    degree_type: {
      type: mongoose.Schema.Types.ObjectId,
    },

    program_type: {
      type: mongoose.Schema.Types.ObjectId,
    },

    specialization_fees: {
      type: [specializationFeeSchema],
      validate: v => Array.isArray(v) && v.length > 0,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

PropertyCourseSchema.index(
  { course_id: 1, property_id: 1 },
  { unique: true }
);

const PropertyCourse = regularDatabase.model(
  "PropertyCourse",
  PropertyCourseSchema
);

export default PropertyCourse;
