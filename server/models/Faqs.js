import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const FaqsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Faqs = regularDatabase.model("Faqs", FaqsSchema);

export default Faqs;
