import mongoose from "mongoose";
import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import { downloadImageAndReplaceSrc } from "../helper/folder-cleaners/EditorImagesController.js";
import LoanProcess from "../models/LoanProcess.js";

export const getAllLoanProcess = async (req, res) => {
    try {
        const loan_process = await LoanProcess.find();
        if (!loan_process) {
            return res.status(404).json({ error: "LoanProcess Not Found" });
        }

        return res.status(200).json(loan_process);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getLoanProcessByPropertyId = async (req, res) => {
    try {
        const { property_id } = req.params;
        const loan_process = await LoanProcess.find({ property_id: property_id });
        if (!loan_process) {
            return res.status(404).json({ error: "LoanProcess Not Found" });
        }

        return res.status(200).json(loan_process);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const AddLoanProcess = async (req, res) => {
    try {
        const {
            userId,
            property_id,
            loan_process,
        } = req.body;

        if (!userId && !property_id) {
            return res.status(400).json({ error: "All Field Required" });
        }

        let updatedLoanProcess = loan_process;
        if (loan_process) {
            updatedLoanProcess = await downloadImageAndReplaceSrc(
                loan_process,
                property_id
            );
        }

        const newLoanProcess = new LoanProcess({
            userId,
            property_id,
            loan_process,
        });

        await newLoanProcess.save();

        const loanProcessCount = await LoanProcess.find({
            property_id: property_id,
        });
        if (loanProcessCount.length === 1) {
            await addPropertyScore({
                property_id,
                property_score: 10,
            });
        }

        return res
            .status(201)
            .json({ message: "LoanProcess successfully" });
    } catch (error) {
        console.error("Add LoanProcess Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const EditLoanProcess = async (req, res) => {
    try {
        const { objectId } = req.params;
        const { property_id, loan_process } = req.body;

        if (!mongoose.Types.ObjectId.isValid(objectId)) {
            return res.status(400).json({ error: "Invalid objectId" });
        }

        const existingLoanProcess = await LoanProcess.findById(objectId);
        if (!existingLoanProcess) {
            return res.status(404).json({ error: "LoanProcess not found." });
        }

        const duplicateLoanProcess = await LoanProcess.findOne({
            _id: { $ne: objectId },
            property_id,
            loan_process: loan_process,
        });

        if (duplicateLoanProcess) {
            return res.status(400).json({
                error:
                    "Another loan process with the same name already exists for this property.",
            });
        }

        let updatedLoanProcessContent = existingLoanProcess.loan_process;
        if (typeof loan_process !== "undefined" && loan_process !== null) {
            updatedLoanProcessContent = await downloadImageAndReplaceSrc(
                loan_process,
                property_id
            );
        }

        const updatedDoc = await LoanProcess.findByIdAndUpdate(
            objectId,
            {
                $set: {
                    loan_process: updatedLoanProcessContent,
                },
            },
            { new: true, runValidators: true }
        );

        return res
            .status(200)
            .json({ message: "LoanProcess updated successfully", data: updatedDoc });
    } catch (error) {
        console.error("Edit LoanProcess Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteLoanProcess = async (req, res) => {
    try {
        const { objectId } = req.params;

        if (!mongoose.isValidObjectId(objectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid loan process ID",
            });
        }

        const deletedLoanProcess = await LoanProcess.findByIdAndDelete(objectId);

        if (!deletedLoanProcess) {
            return res.status(404).json({
                success: false,
                message: "Loan Process not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Loan Process deleted successfully",
        });
    } catch (error) {
        console.error("Delete Loan Process Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};