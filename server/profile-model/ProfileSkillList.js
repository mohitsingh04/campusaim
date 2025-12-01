import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const SkillListSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    skill: {
      type: String,
    },
  },
  { timestamps: true }
);

const ProfileSkillList = profileDatabase.model("skill", SkillListSchema);

export default ProfileSkillList;
