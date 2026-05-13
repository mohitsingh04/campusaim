import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const StatusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    parent_status: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true },
);

const Status = regularDatabase.model("Status", StatusSchema);

export default Status;
