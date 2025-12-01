import mongoose from "mongoose";
import { askDatabase } from "../database/Databases.js";

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },

    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },

    type: {
        type: String,
        enum: ["NEW_ANSWER", "ACCEPTED_ANSWER", "NEW_COMMENT", "FOLLOWED_QUESTION", "USER_FOLLOWED", "USER_ASKED_QUESTION", "TOPIC_NEW_QUESTION"],
        required: true,
    },

    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    isRead: { type: Boolean, default: false },

}, { timestamps: true });

const Notification = askDatabase.model("Notification", notificationSchema);
export default Notification;