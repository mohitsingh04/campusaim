import mongoose from "mongoose";
import { askDatabase } from "../database/Databases.js";

const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },

    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    answer: { type: mongoose.Schema.Types.ObjectId, ref: "Answer" },

}, { timestamps: true });

const Comment = askDatabase.model("Comment", commentSchema);
export default Comment;