import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const AccomodationSchema = mongoose.Schema(
  {
    userId: { type: Number },
    property_id: { type: Number },
    uniqueId: {
      type: Number,
      required: true,
      unique: true,
    },
    accomodation_name: { type: String },
    accomodation_price: { type: Object },
    accomodation_description: { type: String },
    accomodation_images: {
      type: Array,
      default: "[]",
    },
  },
  { timestamps: true }
);

const Accomodation = regularDatabase.model("accomodation", AccomodationSchema);

export default Accomodation;
