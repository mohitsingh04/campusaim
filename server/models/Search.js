import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const SearchSchema = new mongoose.Schema({
  uniqueId: {
    type: Number,
    required: true,
  },
  search: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Search = regularDatabase.model("Search", SearchSchema);

export default Search;
