import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

const Organization = db.model("Organization", organizationSchema);
export default Organization;