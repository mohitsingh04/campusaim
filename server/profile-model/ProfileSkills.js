import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const profileSkillsSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    },
    skills: {
      type: Array,
    },
  },
  { timestamps: true }
);

const ProfileSkills = profileDatabase.model(
  "profile-skills",
  profileSkillsSchema
);

export default ProfileSkills;
