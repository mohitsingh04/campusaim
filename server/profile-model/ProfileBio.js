import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const profileBioSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    },
    heading: {
      type: String,
    },
    about: {
      type: String,
    },
  },
  { timestamps: true }
);

const ProfileBio = profileDatabase.model("bio", profileBioSchema);
export default ProfileBio;
