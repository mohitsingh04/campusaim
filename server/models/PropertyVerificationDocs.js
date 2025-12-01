import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const PropertyDocSchema = mongoose.Schema(
  {
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    business_identity_proof: {
      type: [String],
    },
    location_proof: {
      type: [String],
    },
  },
  { timestamps: true }
);

const PropertyVerificationDocs = regularDatabase.model(
  "property-verification-doc",
  PropertyDocSchema
);

export default PropertyVerificationDocs;
