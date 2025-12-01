import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const pairedMessageSchema = new mongoose.Schema(
  {
    user: {
      text: {
        type: String,
        required: true,
        trim: true,
      },
      time: {
        type: Date,
        default: Date.now,
      },
    },
    assistant: {
      text: {
        type: String,
        trim: true,
      },
      property_ids: {
        type: [mongoose.Schema.Types.ObjectId],
      },
      property_summary_id: {
        type: mongoose.Schema.Types.ObjectId,
      },
      time: {
        type: Date,
        default: Date.now,
      },
    },
  },
  { _id: false }
);

const prernaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uniqueId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },
    chats: {
      type: [pairedMessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const PrernaAiModal = profileDatabase.model("prerna-ai", prernaSchema);
