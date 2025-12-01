import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const PropertyVerificationSchema = new mongoose.Schema(
  {
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      unique: true,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    email_verify_otp: {
      type: Number,
    },
    email_verify_otp_expiry: {
      type: Date,
    },
    mobile_verified: {
      type: Boolean,
      default: false,
    },
    mobile_verify_otp: {
      type: Number,
    },
    mobile_verify_otp_expiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

// ✅ Auto-clear email OTP fields when email_verified = true
PropertyVerificationSchema.pre("save", function (next) {
  if (this.email_verified === true) {
    this.email_verify_otp = undefined;
    this.email_verify_otp_expiry = undefined;
  }
  next();
});

// ✅ Auto-clear mobile OTP fields when mobile_verified = true
PropertyVerificationSchema.pre("save", function (next) {
  if (this.mobile_verified === true) {
    this.mobile_verify_otp = undefined;
    this.mobile_verify_otp_expiry = undefined;
  }
  next();
});

const PropertyVerification = regularDatabase.model(
  "property_verification",
  PropertyVerificationSchema
);

export default PropertyVerification;
