import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const applySchema = mongoose.Schema(
  {
    uniqueId: { type: Number, required: true },
    userId: { type: Number, required: true },
    hiringId: { type: Number, required: true },
    property_id: { type: Number },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

const ApplyHiring = regularDatabase.model("apply-hiring", applySchema);
export default ApplyHiring;
