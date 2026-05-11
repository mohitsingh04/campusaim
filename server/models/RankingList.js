import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const RankingListSchema = new mongoose.Schema(
  {
    rank_name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    rank_value: {
      type: [
        {
          value_name: {
            type: String,
          },
        },
      ],
    },
  },
  { timestamps: true },
);

const RankingList = regularDatabase.model("ranking-list", RankingListSchema);

export default RankingList;
