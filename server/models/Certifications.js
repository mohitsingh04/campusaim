import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const CertificationsSchema = mongoose.Schema({
  property_id: {
    type: Number,
    required: true,
  },
  uniqueId: {
    type: Number,
    required: true,
  },
  certifications: {
    type: Array,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Certifications = regularDatabase.model(
  "Certifications",
  CertificationsSchema
);

export default Certifications;
