import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const LoanProcessSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId },
        property_id: { type: mongoose.Schema.Types.ObjectId },
        loan_process: { type: String },
    },
    { timestamps: true }
);

const LoanProcess = regularDatabase.model("LoanProcess", LoanProcessSchema);

export default LoanProcess;
