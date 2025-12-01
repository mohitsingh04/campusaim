import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const ProfilePropertiesSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    property_name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ProfileProperties = profileDatabase.model(
  "profile-properties",
  ProfilePropertiesSchema
);

export default ProfileProperties;
