import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const PropertyClassessSchema = mongoose.Schema(
  {
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    classess: {
      type: [
        {
          class_name: {
            type: String,
            required: true,
          },
          is_available: {
            type: Boolean,
            default: false,
          },
          admission_open: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
  },
  { timestamps: true },
);

const PropertyClassess = regularDatabase?.model(
  "property-classess",
  PropertyClassessSchema,
);

export default PropertyClassess;
