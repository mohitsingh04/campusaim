import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    uniqueId: {
        type: Number,
        required: true,
    },
    teamLeader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    avatar: {
        type: Array,
    },
    banner: {
        type: Array,
    },
    username: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    mobile_no: {
        type: String,
    },
    alt_mobile_no: {
        type: String,
    },
    ref_code: { type: String, unique: true, default: undefined },
    ref_by: { type: String, default: undefined },
    password: {
        type: String,
    },
    status: {
        type: String,
        default: "Active",
    },
    isGoogleLogin: {
        type: Boolean,
        default: false,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "role"
    },
    permissions: {
        type: [mongoose.Schema.Types.ObjectId],
    },
    isProfessional: {
        type: Boolean,
        default: false,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    verifyToken: {
        type: String,
    },
    verifyTokenExpiry: {
        type: Date,
    },
    resetToken: {
        type: String,
    },
    resetTokenExpiry: {
        type: Date,
    },
    professionalToken: {
        type: String,
    },
    professionalTokenExpiry: {
        type: Date,
    },
    deletionToken: {
        type: String,
    },
    deletionTokenExpiry: {
        type: Date,
    },
    lastLoginAt: { type: Date, default: null },
});

const RegularUser = mongoose.models.user || mongoose.model("user", userSchema);
export default RegularUser;