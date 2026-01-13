import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const enquiryModel = mongoose.Schema(
  {
    userId: {
      type: Number,
    },
    property_name: {
      type: String,
      required: true,
    },
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
    },
    status: {
      type: String,
      default: "Pending",
    },
    city: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

const Enquiry = regularDatabase.model("enquiry", enquiryModel);

export default Enquiry;
