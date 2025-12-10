import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const PropertyScholarshipSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId },
        property_id: { type: mongoose.Schema.Types.ObjectId },
        scholarship: { type: String },
    },
    { timestamps: true }
);

const PropertyScholarship = regularDatabase.model("PropertyScholarship", PropertyScholarshipSchema);

export default PropertyScholarship;
