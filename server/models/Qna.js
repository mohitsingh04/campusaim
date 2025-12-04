import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const QnASchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId },
        property_id: { type: mongoose.Schema.Types.ObjectId },
        question: {
            type: String,
            required: true,
        },
        answer: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            default: "Pending",
        },
    },
    { timestamps: true }
);

const QnA = regularDatabase.model("QnA", QnASchema);

export default QnA;
