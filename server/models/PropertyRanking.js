import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const PropertyRankingSchema = new mongoose.Schema(
  {
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "properties",
      unqiue: true,
    },
    ranks: [
      {
        rank_name: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ranking-list",
          required: true,
        },
        value_name: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

const PropertyRanking = regularDatabase.model(
  "property-ranking",
  PropertyRankingSchema,
);

export default PropertyRanking;
