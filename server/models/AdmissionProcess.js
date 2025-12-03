import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const AdmissionProcessSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId },
        property_id: { type: mongoose.Schema.Types.ObjectId },
        admission_process: { type: String },
    },
    { timestamps: true }
);

const AdmissionProcess = regularDatabase.model("AdmissionProcess", AdmissionProcessSchema);

export default AdmissionProcess;
