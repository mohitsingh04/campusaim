import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    role: String
});

export default mongoose.models.role || mongoose.model("role", roleSchema);