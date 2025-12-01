import mongoose from "mongoose";
import { analyticDatabase } from "../database/Databases.js";

const SearchAppearanceSchema = new mongoose.Schema({
  uniqueId: {
    type: Number,
    required: true,
  },
  searchId: {
    type: Number,
    required: true,
  },
  searched: [
    {
      ip: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const SearchAppearance = analyticDatabase.model(
  "SearchAppearance",
  SearchAppearanceSchema
);

export default SearchAppearance;
