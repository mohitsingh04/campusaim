import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const legalSchema = mongoose.Schema(
  {
    privacyPolicy: {
      type: String,
    },
    terms: {
      type: String,
    },
    disclaimer: {
      type: String,
    },
    cancelationPolicy: {
      type: String,
    },
    cookies: {
      type: String,
    },
  },
  { timestamps: true }
);

const Legal = regularDatabase.model("Legal", legalSchema);
export default Legal;
