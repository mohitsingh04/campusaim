import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const CourseEnquirySchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile_no: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

const CourseEnquiry = regularDatabase.model(
  "course_enquiry",
  CourseEnquirySchema
);

export default CourseEnquiry;
