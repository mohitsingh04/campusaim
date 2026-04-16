import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

// const documentsSchema = new mongoose.Schema(
//     {
//         userId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: true,
//         },

//         aadhaarCardNumber: {
//             type: Number,
//             required: true,
//             match: /^\d{12}$/,
//             unique: true,
//             trim: true,
//         },

//         aadhaarCardFrontImg: {
//             type: String,
//             required: true,
//             trim: true,
//         },

//         aadhaarCardFrontImgCompressed: {
//             type: String,
//             trim: true,
//         },

//         aadhaarCardBackImg: {
//             type: String,
//             required: true,
//             trim: true,
//         },

//         aadhaarCardBackImgCompressed: {
//             type: String,
//             trim: true,
//         },

//         panCardNumber: {
//             type: String,
//             required: true,
//             match: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
//             unique: true,
//             trim: true,
//         },

//         panCardFrontImg: {
//             type: String,
//             required: true,
//             trim: true,
//         },

//         panCardFrontImgCompressed: {
//             type: String,
//             trim: true,
//         },
//     },
//     { timestamps: true }
// );

const documentsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // 🔴 FIX: MUST be STRING (not Number)
        aadhaarCardNumber: {
            type: String,
            required: true,
            match: [/^\d{12}$/, "Aadhaar must be 12 digits"],
            trim: true,
            unique: true,
        },

        aadhaarCardFrontImg: { type: String, required: true, trim: true },
        aadhaarCardFrontImgCompressed: { type: String, trim: true },

        aadhaarCardBackImg: { type: String, required: true, trim: true },
        aadhaarCardBackImgCompressed: { type: String, trim: true },

        panCardNumber: {
            type: String,
            required: true,
            match: [/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN format"],
            uppercase: true,
            trim: true,
            unique: true,
        },

        panCardFrontImg: { type: String, required: true, trim: true },
        panCardFrontImgCompressed: { type: String, trim: true },

    }, { timestamps: true });

const Documents = db.model("Documents", documentsSchema);
export default Documents;
