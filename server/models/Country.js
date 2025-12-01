import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const CountrySchema = new mongoose.Schema(
  {
    id: {
      type: Number,
    },
    country_name: {
      type: String,
    },
    iso3: {
      type: String,
    },
    iso2: {
      type: String,
    },
    numeric_code: {
      type: Number,
    },
    phone_code: {
      type: Number,
    },
    capital: {
      type: String,
    },
    currency: {
      type: String,
    },
    currency_name: {
      type: String,
    },
    currency_symbol: {
      type: String,
    },
    region: {
      type: String,
    },
    subregion: {
      type: String,
    },
    nationality: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Country = regularDatabase.model("Country", CountrySchema);

export default Country;
