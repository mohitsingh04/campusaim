import mongoose from "mongoose";
import { askDatabase } from "../database/Databases.js";

const VoteSchema = new mongoose.Schema({
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    answer: { type: mongoose.Schema.Types.ObjectId, ref: "Answer" },

    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
}, { timestamps: true });

const Vote = askDatabase.model("Vote", VoteSchema);
export default Vote;