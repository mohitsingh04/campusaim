import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const ReviewSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  uniqueId: {
    type: Number,
  },
  property_id: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  phone_number: {
    type: String,
  },
  rating: {
    type: Number,
    required: [true, "Please Provide a rating"],
  },
  review: {
    type: String,
    required: [true, "Please Provide a review"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = regularDatabase.model("Review", ReviewSchema);

export default Review;
