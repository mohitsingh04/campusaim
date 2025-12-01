import mongoose from "mongoose";
import { analyticDatabase } from "../database/Databases.js";

const seoSchema = mongoose.Schema(
  {
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    seo_score: {
      type: Number,
    },
  },
  { timestamp: true }
);

const SeoScore = analyticDatabase.model("property_seo_score", seoSchema);
export default SeoScore;
