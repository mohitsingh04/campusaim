import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const propertyRetreatSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    retreat_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    retreat_short_name: {
      type: String,
    },
    description: { type: String },
    retreat_type: { type: mongoose.Schema.Types.ObjectId },
    retreat_format: { type: mongoose.Schema.Types.ObjectId },
    retreat_difficulty_level: { type: mongoose.Schema.Types.ObjectId },
    retreat_certification_type: { type: mongoose.Schema.Types.ObjectId },
    capacity: { type: Number },
    cancellation_policy: { type: String },
    duration: { type: String },
    certification_available: { type: Boolean },
    requirements: { type: [mongoose.Schema.Types.ObjectId] },
    key_outcomes: { type: [mongoose.Schema.Types.ObjectId] },
    best_for: { type: [String] },
    languages: { type: [String] },
    price: { type: Object },
    booking_deadline: { type: Date },
    start_date: { type: Date },
    end_date: { type: Date },
    accommodation: { type: [String] },
    featured_image: { type: [String] },
    inclusions: { type: String },
    exclusions: { type: String },
    routine: {
      type: Array,
    },
    status: {
      type: String,
      default: "Active",
    },
  },
  { timestamps: true }
);

const PropertyRetreat = regularDatabase.model(
  "property-retreat",
  propertyRetreatSchema
);

export default PropertyRetreat;
