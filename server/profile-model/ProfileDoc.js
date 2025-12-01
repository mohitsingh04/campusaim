import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const profileDocSchema = await mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    },
    resume: {
      type: String,
      required: true,
    },
  },
  { timestamp: true }
);

const ProfileDoc = profileDatabase.model("docs", profileDocSchema);
export default ProfileDoc;
