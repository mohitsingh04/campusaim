import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const RequirmentsSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    requirment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Requirments = regularDatabase.model("requirments", RequirmentsSchema);

export default Requirments;
