import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const StatusSchema = new mongoose.Schema({
  uniqueId: {
    type: Number,
    required: true,
  },
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Status = regularDatabase.model("Status", StatusSchema);

export default Status;
