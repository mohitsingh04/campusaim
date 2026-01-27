import mongoose from "mongoose";
import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import { downloadImageAndReplaceSrc } from "../helper/folder-cleaners/EditorImagesController.js";
import AdmissionProcess from "../models/AdmissionProcess.js";

export const getAllAdmissionProcess = async (req, res) => {
    try {
        const admissionProcess = await AdmissionProcess.find();
        if (!admissionProcess) {
            return res.status(404).json({ error: "Admission Process Not Found!" });
        }

        return res.status(200).json(admissionProcess);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getAdmissionProcessByPropertyId = async (req, res) => {
    try {
        const { property_id } = req.params;
        const admissionProcess = await AdmissionProcess.find({ property_id: property_id });
        if (!admissionProcess) {
            return res.status(404).json({ error: "Admission Process Not Found" });
        }

        return res.status(200).json(admissionProcess);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const AddAdmissionProcess = async (req, res) => {
    try {
        const {
            userId,
            property_id,
            admission_process,
        } = req.body;

        if (!userId && !property_id) {
            return res.status(400).json({ error: "All Field Required" });
        }

        let updatedAdmissionProcess = admission_process;
        if (admission_process) {
            updatedAdmissionProcess = await downloadImageAndReplaceSrc(
                admission_process,
                property_id
            );
        }

        const newAdmissionProcess = new AdmissionProcess({
            userId,
            property_id,
            admission_process,
        });

        await newAdmissionProcess.save();

        const admissionProcessCount = await AdmissionProcess.find({
            property_id: property_id,
        });
        if (admissionProcessCount.length === 1) {
            await addPropertyScore({
                property_id,
                property_score: 10,
            });
        }

        return res
            .status(201)
            .json({ message: "Admission Process successfully" });
    } catch (error) {
        console.error("Add Admission Process Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const EditAdmissionProcess = async (req, res) => {
    try {
        const { objectId } = req.params;
        const { property_id, admission_process } = req.body;

        if (!mongoose.Types.ObjectId.isValid(objectId)) {
            return res.status(400).json({ error: "Invalid objectId" });
        }

        const existingAdmissionProcess = await AdmissionProcess.findById(objectId);
        if (!existingAdmissionProcess) {
            return res.status(404).json({ error: "AdmissionProcess not found." });
        }

        const duplicateAdmissionProcess = await AdmissionProcess.findOne({
            _id: { $ne: objectId },
            property_id,
            admission_process: admission_process,
        });

        if (duplicateAdmissionProcess) {
            return res.status(400).json({
                error:
                    "Another Admission Process with the same name already exists for this property.",
            });
        }

        let updatedAdmissionProcess = existingAdmissionProcess.admission_process;
        if (typeof admission_process !== "undefined" && admission_process !== null) {
            updatedAdmissionProcess = await downloadImageAndReplaceSrc(
                admission_process,
                property_id
            );
        }

        const updatedDoc = await AdmissionProcess.findByIdAndUpdate(
            objectId,
            {
                $set: {
                    admission_process: updatedAdmissionProcess,
                },
            },
            { new: true, runValidators: true }
        );

        return res
            .status(200)
            .json({ message: "Admission Process updated successfully", data: updatedDoc });
    } catch (error) {
        console.error("Edit Admission Process Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteAdmissionProcess = async (req, res) => {
    try {
        const { objectId } = req.params;

        if (!mongoose.isValidObjectId(objectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admission process ID",
            });
        }

        const deletedAdmissionProcess = await AdmissionProcess.findByIdAndDelete(objectId);

        if (!deletedAdmissionProcess) {
            return res.status(404).json({
                success: false,
                message: "AdmissionProcess not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "AdmissionProcess deleted successfully",
        });
    } catch (error) {
        console.error("Delete AdmissionProcess Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};