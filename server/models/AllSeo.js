import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const SeoSchema = new mongoose.Schema(
  {
    blog_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    exam_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    scholarship_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    news_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    retreat_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    title: String,
    slug: String,
    primary_focus_keyword: [String],
    json_schema: String,
    meta_description: String,
    type: String,
    seo_score: Number,
  },
  { timestamps: true }
);

const AllSeo = regularDatabase.model("seo", SeoSchema);
export default AllSeo;
