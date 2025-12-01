import mongoose from "mongoose";
import { analyticDatabase } from "../database/Databases.js";

const rankSchema = mongoose.Schema(
  {
    rank: {
      type: Number,
    },
    overallScore: {
      type: Number,
    },
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true,
      required: true,
    },
    lastRank: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Rank = analyticDatabase.model("property-rank", rankSchema);

export default Rank;
