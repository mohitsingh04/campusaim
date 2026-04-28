import mongoose from "mongoose";
import { leadsDatabase } from "../database/Databases.js";

const nicheSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: String
});

export const Niche = leadsDatabase.models.Niche || leadsDatabase.model("Niche", nicheSchema);