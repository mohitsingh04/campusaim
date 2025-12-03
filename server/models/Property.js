import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const PropertySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    uniqueId: {
      type: Number,
      required: true,
    },
    property_name: {
      type: String,
      required: true,
    },
    property_short_name: {
      type: String,
    },
    property_email: {
      type: String,
      required: true,
    },
    property_mobile_no: {
      type: String,
      required: true,
    },
    property_alt_mobile_no: {
      type: String,
    },
    property_logo: {
      type: Array,
    },
    featured_image: {
      type: Array,
    },
    property_description: {
      type: String,
    },
    est_year: {
      type: Number,
    },
    academic_type: {
      type: mongoose.Schema.Types.ObjectId,
    },
    property_slug: {
      type: String,
      unique: true,
    },
    approved_by: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    }],
    affiliated_by: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    }],
    status: {
      type: String,
      default: "Pending",
    },
    property_type: {
      type: mongoose.Schema.Types.ObjectId,
    },
    property_website: {
      type: String,
    },
    sponsered: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    claimed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Property = regularDatabase.model("Property", PropertySchema);

export default Property;
