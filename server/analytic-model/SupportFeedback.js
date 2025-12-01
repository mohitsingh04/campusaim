import mongoose from "mongoose";
import { analyticDatabase } from "../database/Databases.js";

const supportFeedbackSchema = mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
    },
    supportUserId: {
      type: Number,
      required: true,
    },
    supportId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    feedback: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const SupportFeedback = analyticDatabase.model(
  "support-feedback",
  supportFeedbackSchema
);

export default SupportFeedback;
