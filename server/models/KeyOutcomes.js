import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const KeyOutcomeSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    key_outcome: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const KeyOutComes = regularDatabase.model("key_outcomes", KeyOutcomeSchema);

export default KeyOutComes;
