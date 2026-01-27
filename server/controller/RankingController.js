import mongoose from "mongoose";
import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import Ranking from "../models/Ranking.js";

export const getAllRanking = async (req, res) => {
    try {
        const ranking = await Ranking.find();
        if (!ranking) {
            return res.status(404).json({ error: "Ranking Not Found" });
        }

        return res.status(200).json(ranking);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getRankingByPropertyId = async (req, res) => {
    try {
        const { property_id } = req.params;
        const ranking = await Ranking.find({ property_id: property_id });
        if (!ranking) {
            return res.status(404).json({ error: "Ranking Not Found" });
        }

        return res.status(200).json(ranking);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const addRanking = async (req, res) => {
    try {
        const { userId, property_id, naac_rank, nirf_rank, nba_rank, qs_rank, times_higher_education_rank } = req.body;

        if (!userId || !property_id) {
            return res.status(400).json({ error: "userId and property_id are required." });
        }

        if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(property_id)) {
            return res.status(400).json({ error: "Invalid userId or property_id." });
        }

        const existing = await Ranking.findOne({ userId, property_id }).lean();
        if (existing) {
            return res.status(409).json({ error: "Ranking already exists for this user & property. Use update endpoint instead." });
        }

        const newRanking = new Ranking({
            userId,
            property_id,
            naac_rank,
            nirf_rank,
            nba_rank,
            qs_rank,
            times_higher_education_rank,
        });

        const saved = await newRanking.save();

        const rankCount = await Ranking.countDocuments({ property_id });

        if (rankCount === 1) {
            try {
                await addPropertyScore({
                    property_id,
                    property_score: 10,
                });
            } catch (scoreErr) {
                console.error("addPropertyScore failed:", scoreErr);
            }
        }

        return res.status(201).json({ message: "Ranking created successfully.", ranking: saved });
    } catch (error) {
        console.error("Add Ranking Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const editRanking = async (req, res) => {
    try {
        const { objectId } = req.params;
        const allowedFields = [
            "naac_rank",
            "nirf_rank",
            "nba_rank",
            "qs_rank",
            "times_higher_education_rank",
        ];

        if (!mongoose.isValidObjectId(objectId)) {
            return res.status(400).json({ error: "Invalid objectId." });
        }

        const existingRanking = await Ranking.findById(objectId).lean();
        if (!existingRanking) {
            return res.status(404).json({ error: "Ranking not found." });
        }

        const update = {};
        // fields that must be numeric
        const numericFields = [
            "nirf_rank",
            "nba_rank",
            "qs_rank",
            "times_higher_education_rank",
        ];

        for (const field of allowedFields) {
            if (!Object.prototype.hasOwnProperty.call(req.body, field)) continue;

            const raw = req.body[field];

            // clear field with empty string
            if (raw === "") {
                update[field] = null;
                continue;
            }

            // skip null/undefined (no change)
            if (raw === null || raw === undefined) {
                continue;
            }

            if (field === "naac_rank") {
                // naac_rank is an ObjectId in your schema
                if (!mongoose.isValidObjectId(String(raw))) {
                    return res
                        .status(400)
                        .json({ error: "naac_rank must be a valid ObjectId or empty string to clear." });
                }
                update[field] = String(raw);
                continue;
            }

            // numeric fields validation
            if (numericFields.includes(field)) {
                // allow numeric strings as well as numbers
                const num = Number(raw);
                if (Number.isNaN(num)) {
                    return res
                        .status(400)
                        .json({ error: `${field} must be a valid number or empty string to clear.` });
                }
                update[field] = num;
                continue;
            }
        }

        if (Object.keys(update).length === 0) {
            return res.status(400).json({ error: "No valid fields provided to update." });
        }

        const updatedDoc = await Ranking.findByIdAndUpdate(
            objectId,
            { $set: update },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedDoc) {
            return res.status(404).json({ error: "Ranking not found after update." });
        }

        return res.status(200).json({
            message: "Ranking updated successfully",
            data: updatedDoc,
        });
    } catch (error) {
        console.error("Edit Ranking Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteRanking = async (req, res) => {
    try {
        const { objectId } = req.params;

        if (!mongoose.isValidObjectId(objectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ranking ID",
            });
        }

        const deletedRanking = await Ranking.findByIdAndDelete(objectId);

        if (!deletedRanking) {
            return res.status(404).json({
                success: false,
                message: "Ranking not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Ranking deleted successfully",
        });
    } catch (error) {
        console.error("Delete Ranking Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};