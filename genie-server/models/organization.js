import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const organizationSchema = new mongoose.Schema(
    {
        nicheId: { type: mongoose.Schema.Types.ObjectId, ref: "niche", required: true },
        organization_name: { type: String, required: true, trim: true },
        website: { type: String, trim: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    { timestamps: true }
);

// ✅ Prevent OverwriteModelError
const Organization = db.models.organization || db.model("organization", organizationSchema);

export default Organization;