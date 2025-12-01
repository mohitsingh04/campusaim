import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const ProfileInstitutesSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    institute_name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ProfileInstitutes = profileDatabase.model(
  "profile-Institutes",
  ProfileInstitutesSchema
);

export default ProfileInstitutes;
