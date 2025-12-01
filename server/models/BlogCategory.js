import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const categorySchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    blog_category: {
      type: String,
      required: true,
    },
    parent_category: {
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

const BlogCategory = regularDatabase.model("blog_category", categorySchema);
export default BlogCategory;
