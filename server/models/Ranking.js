import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const RankingSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId },
        property_id: { type: mongoose.Schema.Types.ObjectId },
        naac_rank: { type: mongoose.Schema.Types.ObjectId },
        nirf_rank: { type: Number },
        nba_rank: { type: Number },
        qs_rank: { type: Number },
        times_higher_education_rank: { type: Number },
    },
    { timestamps: true }
);

const Ranking = regularDatabase.model("Ranking", RankingSchema);

export default Ranking;
