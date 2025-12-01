import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const permissionsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    roles: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "roles",
      required: true,
    },
    permissions: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          default: "",
        },
      },
    ],
  },
  { timestamps: true }
);

export const ProfilePermissions = profileDatabase.model(
  "permissions",
  permissionsSchema
);
