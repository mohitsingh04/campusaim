import mongoose from "mongoose";
import { analyticDatabase } from "../database/Databases.js";

const supportSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: "Active",
    },
    ended: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Support = analyticDatabase.model("Support", supportSchema);

const supportMessageSchema = new mongoose.Schema(
  {
    supportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Support",
      required: true,
    },
    userId: {
      type: Number,
    },
    senderType: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      trim: true,
    },
    files: [String],
    isView: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const SupportMessage = analyticDatabase.model(
  "SupportMessage",
  supportMessageSchema
);
