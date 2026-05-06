import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: { type: String, default: "Drafted" },
    featured_image: { type: [String] },
    publish_date: { type: Date },
    faqs: {
      type: [{ question: { type: String }, answer: { type: String } }],
    },
  },
  { timestamps: true },
);

const NewsAndUpdates = regularDatabase.model("NewsAndUpdates", newsSchema);
export default NewsAndUpdates;
