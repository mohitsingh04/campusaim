import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const couponSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    },
    property_id: {
      type: Number,
      required: true,
    },
    coupon_code: {
      type: String,
      required: true,
    },
    start_from: {
      type: Date,
      required: true,
    },
    valid_upto: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Coupon = regularDatabase.model("coupons", couponSchema);
export default Coupon;
