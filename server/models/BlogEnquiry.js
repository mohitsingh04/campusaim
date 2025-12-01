import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const BlogEnquirySchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile_no: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    blogId: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const BlogEnquiry = regularDatabase.model("blog_enquiry", BlogEnquirySchema);

export default BlogEnquiry;
