import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const LanguagesListSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    language: {
      type: String,
    },
  },
  { timestamps: true }
);

const ProfileLanguagesList = profileDatabase.model(
  "languages",
  LanguagesListSchema
);

export default ProfileLanguagesList;
