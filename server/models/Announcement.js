import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const AnnouncementSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId },
        property_id: { type: mongoose.Schema.Types.ObjectId },
        announcement: { type: String },
    },
    { timestamps: true }
);

const Announcement = regularDatabase.model("Announcement", AnnouncementSchema);

export default Announcement;
