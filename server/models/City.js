import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const CitySchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  name: {
    type: String,
  },
  state_id: {
    type: Number,
  },
  state_code: {
    type: String,
  },
  state_name: {
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
  latitude: {
    type: String,
  },
  longitude: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const City = regularDatabase.model("City", CitySchema);

export default City;
