import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const CategorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    category_name: {
      type: String,
      required: true,
    },
    category_icon: {
      type: Array,
    },
    featured_image: {
      type: Array,
    },
    description: {
      type: String,
    },
    parent_category: {
      type: String,
      default: null,
    },
    slug: {
      type: String,
    },
    status: {
      type: String,
      default: "Active",
    },
  },
  { timestamps: true },
);

// ✅ Compound unique index — allows same name under different parent
CategorySchema.index(
  { category_name: 1, parent_category: 1 },
  { unique: true },
);

const Category = regularDatabase.model("Category", CategorySchema);

export default Category;
