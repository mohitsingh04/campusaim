import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const ProfileScoreSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
    },
  },
  { timestamps: true }
);

const ProfileScore = profileDatabase.model("profile-score", ProfileScoreSchema);

export default ProfileScore;
