import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const legalItemSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const legalSchema = new mongoose.Schema(
  {
    privacy_policy: {
      type: legalItemSchema,
      default: () => ({ content: "", date: null }),
    },
    terms: {
      type: legalItemSchema,
      default: () => ({ content: "", date: null }),
    },
    disclaimer: {
      type: legalItemSchema,
      default: () => ({ content: "", date: null }),
    },
    cancelation_policy: {
      type: legalItemSchema,
      default: () => ({ content: "", date: null }),
    },
    cookies: {
      type: legalItemSchema,
      default: () => ({ content: "", date: null }),
    },
    community_guidlines: {
      type: legalItemSchema,
      default: () => ({ content: "", date: null }),
    },
  },
  { timestamps: true },
);

const Legal = regularDatabase.model("Legal", legalSchema);

export default Legal;
