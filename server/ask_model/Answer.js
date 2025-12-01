import mongoose from "mongoose";
import { askDatabase } from "../database/Databases.js";

const answerSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },

    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],

    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
}
    // , { timestamps: true }
);

const Answer = askDatabase.model("Answer", answerSchema);
export default Answer;