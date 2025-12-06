import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
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
