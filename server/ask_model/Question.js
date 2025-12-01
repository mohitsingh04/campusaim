import mongoose from "mongoose";
import { askDatabase } from "../database/Databases.js";

const questionSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String },
    slug: { type: String, required: true, unique: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],

    views: { type: Number, default: 0 },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    viewedIPs: [{ type: String }],

    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
}
    // , { timestamps: true }
);

const Question = askDatabase.model("Question", questionSchema);
export default Question;