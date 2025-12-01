import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const ProfileDegreeSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    degree_name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ProfileDegree = profileDatabase.model(
  "profile-Degree",
  ProfileDegreeSchema
);

export default ProfileDegree;
