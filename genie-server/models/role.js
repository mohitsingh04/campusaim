import mongoose from "mongoose";
import { campusaimDB } from "../mongoose/index.js";

const roleSchema = new mongoose.Schema({
    role: String
});

const Role = campusaimDB.models.role || campusaimDB.model("role", roleSchema);
export default Role;