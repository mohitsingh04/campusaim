import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const EducationSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    },
    degree: {
      type: Number,
    },
    institute: {
      type: Number,
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
    currentlyStuding: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const ProfileEducation = profileDatabase.model("education", EducationSchema);
export default ProfileEducation;
