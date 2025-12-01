import mongoose from "mongoose";
import { askDatabase } from "../database/Databases.js";

const reputationSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    score: { type: Number, default: 0 },
}, { timestamps: true });

const Reputation = askDatabase.model("Reputation", reputationSchema);
export default Reputation;