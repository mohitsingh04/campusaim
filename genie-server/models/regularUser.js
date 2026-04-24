import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "role"
    }
});

const RegularUser = mongoose.models.user || mongoose.model("user", userSchema);
export default RegularUser;