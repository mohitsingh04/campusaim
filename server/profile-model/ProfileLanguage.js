import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const profileLanguageSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    },
    languages: {
      type: Array,
    },
  },
  { timestamps: true }
);

const ProfileLanguage = profileDatabase.model(
  "profile-languages",
  profileLanguageSchema
);

export default ProfileLanguage;
