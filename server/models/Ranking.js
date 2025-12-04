import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const RankingSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId },
        property_id: { type: mongoose.Schema.Types.ObjectId },
        naac_rank: { type: String },
        nirf_rank: { type: String },
        nba_rank: { type: String },
        other_ranking: { type: String },
    },
    { timestamps: true }
);

const Ranking = regularDatabase.model("Ranking", RankingSchema);

export default Ranking;
