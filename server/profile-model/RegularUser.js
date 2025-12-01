import mongoose from "mongoose";
import { profileDatabase } from "../database/Databases.js";

const regularUserSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    avatar: {
      type: Array,
    },
    banner: {
      type: Array,
    },
    username: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    mobile_no: {
      type: String,
    },
    alt_mobile_no: {
      type: String,
    },
    password: {
      type: String,
    },
    status: {
      type: String,
      default: "Active",
    },
    isGoogleLogin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
    },
    permissions: {
      type: [mongoose.Schema.Types.ObjectId],
    },
    isProfessional: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifyToken: {
      type: String,
    },
    verifyTokenExpiry: {
      type: Date,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
    professionalToken: {
      type: String,
    },
    professionalTokenExpiry: {
      type: Date,
    },
    deletionToken: {
      type: String,
    },
    deletionTokenExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

const RegularUser = profileDatabase.model("user", regularUserSchema);

export default RegularUser;
