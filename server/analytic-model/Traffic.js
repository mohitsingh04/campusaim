import mongoose from "mongoose";
import { analyticDatabase } from "../database/Databases.js";

const trafficSchema = new mongoose.Schema(
  {
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: String,
      required: true,
      enum: [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
      ],
    },
    daily: {
      type: [
        {
          day: {
            type: String,
            match: /^(0[1-9]|[12][0-9]|3[01])$/,
            required: true,
          },
          clicks: {
            type: Number,
            min: 0,
            required: true,
          },
        },
      ],
      required: true,
    },
  },
  { timestamps: true }
);

const Traffic = analyticDatabase.model("property-traffic", trafficSchema);
export default Traffic;
