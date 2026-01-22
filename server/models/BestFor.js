import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const BestForSchema = mongoose.Schema(
    {
        uniqueId: {
            type: Number,
            required: true,
        },
        best_for: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const BestFor = regularDatabase.model("BestFor", BestForSchema);

export default BestFor;