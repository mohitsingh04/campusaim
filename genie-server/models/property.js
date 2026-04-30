import mongoose from "mongoose";
import { db } from "../mongoose/index.js"; // 👈 your createConnection

const propertySchema = new mongoose.Schema({
    _id: { type: String, required: true },
    uniqueId: { type: Number, required: true },
    name: { type: String, trim: true },
}, { timestamps: true });

// ✅ MUST use db (external connection), NOT mongoose
const Property = db.models.property || db.model("property", propertySchema, "property");

export default Property;