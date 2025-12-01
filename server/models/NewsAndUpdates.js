import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const newsSchema = new mongoose.Schema(
  {
    uniqueId: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: { type: String, default: "Drafted" },
    featured_image: { type: [String] },
    publish_date: { type: Date },
  },
  { timestamps: true }
);

const NewsAndUpdates = regularDatabase.model("NewsAndUpdates", newsSchema);
export default NewsAndUpdates;
