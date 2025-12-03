import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const ScholarshipSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId },
        property_id: { type: mongoose.Schema.Types.ObjectId },
        scholarship: { type: String },
    },
    { timestamps: true }
);

const Scholarship = regularDatabase.model("Scholarship", ScholarshipSchema);

export default Scholarship;
