import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const locationSchema = mongoose.Schema(
  {
    property_id: {
      type: Number,
      required: true,
    },
    property_address: {
      type: String,
    },
    property_pincode: {
      type: String,
    },
    property_country: {
      type: String,
    },
    property_state: {
      type: String,
    },
    property_city: {
      type: String,
    },
  },
  { timestamps: true }
);

const Location = regularDatabase.model("location", locationSchema);

export default Location;
