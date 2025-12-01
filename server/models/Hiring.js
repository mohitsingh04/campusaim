import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const HiringSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    property_id: { type: Number, required: true },
    title: {
      type: String,
      required: true,
    },
    job_description: {
      type: String,
    },
    experience: {
      type: String,
    },
    job_type: {
      type: String,
    },
    start_date: { type: Date },
    end_date: { type: Date },
    salary: { type: Object },
    skills: { type: Array },
    qualification: { type: Array },
    status: {
      type: String,
      default: "Active",
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Hiring = regularDatabase.model("hiring", HiringSchema);

export default Hiring;
