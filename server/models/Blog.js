import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const blogSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    blog: {
      type: String,
      required: true,
    },
    category: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "blog_category",
    },
    tags: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "blog_tags",
    },
    status: {
      type: String,
      default: "Active",
    },
    featured_image: {
      type: Array,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
    },
    faqs: {
      type: [{ question: { type: String }, answer: { type: String } }],
    },
  },
  { timestamps: true },
);

const Blog = regularDatabase.model("blogs", blogSchema);
export default Blog;
