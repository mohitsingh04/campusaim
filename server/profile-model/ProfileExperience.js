import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const ProfileExperienceSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    },
    property_id: {
      type: Number,
    },
    property_name_id: {
      type: Number,
    },
    position: {
      type: String,
    },
    location: {
      type: String,
    },
    currentlyWorking: {
      type: Boolean,
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
  },
  { timestamps: true }
);

const ProfileExperience = profileDatabase.model(
  "experience",
  ProfileExperienceSchema
);

export default ProfileExperience;
