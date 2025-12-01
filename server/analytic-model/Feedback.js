import mongoose from "mongoose";
import { analyticDatabase } from "../database/Databases.js";

const feedbackSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    reaction: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    userId: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Feedback = analyticDatabase.model("feedback", feedbackSchema);

export default Feedback;
