import mongoose from "mongoose";
import { analyticDatabase } from "../database/Databases.js";

const CompareSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    properties: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
    },
    count: { type: Number },
  },
  { timestamps: true }
);

const Compare = analyticDatabase.model("compare", CompareSchema);

export default Compare;
