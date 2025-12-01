import mongoose from "mongoose";
import { analyticDatabase } from "../database/Databases.js";

const SearchSchema = mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      required: true,
    },
    search: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Search = analyticDatabase.model("search", SearchSchema);

export default Search;
