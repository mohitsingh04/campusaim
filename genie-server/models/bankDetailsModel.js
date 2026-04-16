import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const bankDetailsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        beneficiaryName: {
            type: String,
            required: true,
            trim: true,
        },

        accountNumber: {
            type: Number,
            required: true,
            trim: true,
        },

        bankName: {
            type: String,
            required: true,
            trim: true,
        },

        ifscCode: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },

        passbookOrCancelCheckbookImg: {
            type: String,
        },

        passbookOrCancelCheckbookImgCompressed: {
            type: String,
        },

    },
    {
        timestamps: true,
    }
);

const BankDetails = db.model("BankDetails", bankDetailsSchema);
export default BankDetails;
