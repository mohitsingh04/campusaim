import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const enquiryModel = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    property_name: {
      type: String,
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
    city: {
      type: String,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Enquiry = regularDatabase.model("enquiry", enquiryModel);

export default Enquiry;
