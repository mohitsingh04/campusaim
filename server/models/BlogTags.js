import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const tagSchema = mongoose.Schema(
  {
    blog_tag: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const BlogTags = regularDatabase.model("blog_tags", tagSchema);

export default BlogTags;
