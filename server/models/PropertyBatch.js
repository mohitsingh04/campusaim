import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const propertyBatchSchema = new mongoose.Schema(
  {
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "property",
    },
    batch_name: {
      type: String,
      required: true,
    },
    batch_start_time: {
      type: String,
      required: true,
    },
    batch_end_time: {
      type: String,
      required: true,
    },
    batch_size: { type: Number },
    price: { type: Number },
    certificate: { type: Boolean, default: false },
    certificate_after: { type: Number },
    demo_class: { type: Number },
    included: { type: [String] },
    status: {
      type: String,
      default: "Active",
    },
  },
  { timestamps: true },
);

const PropertyBatch = regularDatabase.model(
  "property-batch",
  propertyBatchSchema,
);
export default PropertyBatch;
