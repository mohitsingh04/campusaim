import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const ProfileConsetsSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    consent: {
      type: Boolean,
      default: false,
    },
    property_consent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ProfileConsent = profileDatabase.model(
  "user-consent",
  ProfileConsetsSchema
);

export default ProfileConsent;
