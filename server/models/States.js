import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const StateSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
    },
    name: {
      type: String,
    },
    country_id: {
      type: Number,
    },
    country_code: {
      type: String,
    },
    country_name: {
      type: String,
    },
    state_code: {
      type: String,
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
  },
  { timestamps: true }
);

const State = regularDatabase.model("State", StateSchema);

export default State;
