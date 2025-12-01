import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const roleSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const ProfileRoles = profileDatabase.model("role", roleSchema);
