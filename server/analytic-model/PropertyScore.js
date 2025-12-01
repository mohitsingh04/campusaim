import mongoose from "mongoose";
import { analyticDatabase } from "../database/Databases.js";

const propertyScoreSchema = mongoose.Schema(
  {
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    property_score: {
      type: Number,
    },
  },
  { timestamp: true }
);

const PropertyScore = analyticDatabase.model(
  "property_score",
  propertyScoreSchema
);
export default PropertyScore;
