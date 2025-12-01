import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const SeoSchema = new mongoose.Schema({
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  title: {
    type: String,
  },
  slug: {
    type: String,
  },
  primary_focus_keyword: {
    type: [String],
  },
  json_schema: {
    type: String,
  },
  meta_description: {
    type: String,
  },
  status: {
    type: String,
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PropertySeo = regularDatabase.model("property-seo", SeoSchema);

export default PropertySeo;
