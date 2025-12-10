import mongoose from "mongoose";
import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import { downloadImageAndReplaceSrc } from "../helper/folder-cleaners/EditorImagesController.js";
import PropertyScholarship from "../models/PropertyScholarship.js";

export const getAllPropertyScholarship = async (req, res) => {
    try {
        const scholarship = await PropertyScholarship.find();
        if (!scholarship) {
            return res.status(404).json({ error: "Scholarship Not Found" });
        }

        return res.status(200).json(scholarship);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getPropertyScholarshipByPropertyId = async (req, res) => {
    try {
        const { property_id } = req.params;
        const scholarship = await PropertyScholarship.find({ property_id: property_id });
        if (!scholarship) {
            return res.status(404).json({ error: "Scholarship Not Found" });
        }

        return res.status(200).json(scholarship);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const AddPropertyScholarship = async (req, res) => {
    try {
        const {
            userId,
            property_id,
            scholarship,
        } = req.body;

        if (!userId && !property_id) {
            return res.status(400).json({ error: "All Field Required" });
        }

        let updatedScholarship = scholarship;
        if (scholarship) {
            updatedScholarship = await downloadImageAndReplaceSrc(
                scholarship,
                property_id
            );
        }

        const newScholarship = new PropertyScholarship({
            userId,
            property_id,
            scholarship,
        });

        await newScholarship.save();

        const scholarshipCount = await PropertyScholarship.find({
            property_id: property_id,
        });
        if (scholarshipCount.length === 1) {
            await addPropertyScore({
                property_id,
                property_score: 10,
            });
        }

        return res
            .status(201)
            .json({ message: "Scholarship successfully" });
    } catch (error) {
        console.error("Add Scholarship Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const EditPropertyScholarship = async (req, res) => {
    try {
        const { objectId } = req.params;
        const { property_id, scholarship } = req.body;

        if (!mongoose.Types.ObjectId.isValid(objectId)) {
            return res.status(400).json({ error: "Invalid objectId" });
        }

        const existingScholarship = await PropertyScholarship.findById(objectId);
        if (!existingScholarship) {
            return res.status(404).json({ error: "Scholarship not found." });
        }

        const duplicateScholarship = await PropertyScholarship.findOne({
            _id: { $ne: objectId },
            property_id,
            scholarship: scholarship,
        });

        if (duplicateScholarship) {
            return res.status(400).json({
                error:
                    "Another scholarship with the same name already exists for this property.",
            });
        }

        let updatedScholarshipContent = existingScholarship.scholarship;
        if (typeof scholarship !== "undefined" && scholarship !== null) {
            updatedScholarshipContent = await downloadImageAndReplaceSrc(
                scholarship,
                property_id
            );
        }

        const updatedDoc = await PropertyScholarship.findByIdAndUpdate(
            objectId,
            {
                $set: {
                    scholarship: updatedScholarshipContent,
                },
            },
            { new: true, runValidators: true }
        );

        return res
            .status(200)
            .json({ message: "Scholarship updated successfully", data: updatedDoc });
    } catch (error) {
        console.error("Edit Scholarship Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};