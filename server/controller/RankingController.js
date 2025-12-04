import mongoose from "mongoose";
import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import { downloadImageAndReplaceSrc } from "../helper/folder-cleaners/EditorImagesController.js";
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
        const { userId, property_id, naac_rank, nirf_rank, nba_rank, other_ranking } = req.body;

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

        let naacToSave = naac_rank;
        if (naac_rank) {
            try {
                const processed = await downloadImageAndReplaceSrc(naac_rank, property_id);
                if (processed) naacToSave = processed;
            } catch (err) {
                console.warn("Naac Rank processing failed, saving original value. error:", err);
            }
        }

        const newRanking = new Ranking({
            userId,
            property_id,
            naac_rank: naacToSave,
            nirf_rank,
            nba_rank,
            other_ranking,
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
        const { property_id, naac_rank, nirf_rank, nba_rank, other_ranking } = req.body;

        if (!mongoose.isValidObjectId(objectId)) {
            return res.status(400).json({ error: "Invalid objectId." });
        }

        const existingRanking = await Ranking.findById(objectId);
        if (!existingRanking) {
            return res.status(404).json({ error: "Ranking not found." });
        }

        const propertyIdToUse = property_id || existingRanking.property_id?.toString();
        if (!propertyIdToUse || !mongoose.isValidObjectId(propertyIdToUse)) {
            return res.status(400).json({ error: "A valid property_id is required (either existing or provided)." });
        }

        const isNaacProvided = typeof naac_rank !== "undefined" && naac_rank !== null;
        const isNirfProvided = typeof nirf_rank !== "undefined" && nirf_rank !== null;
        const isNbaProvided = typeof nba_rank !== "undefined" && nba_rank !== null;
        const isOtherProvided = typeof other_ranking !== "undefined" && other_ranking !== null;

        if (!isNaacProvided && !isNirfProvided && !isNbaProvided && !isOtherProvided && !property_id) {
            return res.status(400).json({ error: "Nothing to update. Provide at least one field to update." });
        }

        let naacToSave = existingRanking.naac_rank;
        if (isNaacProvided) {
            try {
                const processed = await downloadImageAndReplaceSrc(naac_rank, propertyIdToUse);
                naacToSave = processed || naac_rank;
            } catch (procErr) {
                console.warn("naac_rank processing failed — falling back to provided value:", procErr);
                naacToSave = naac_rank;
            }
        }

        const duplicateQuery = { _id: { $ne: objectId }, property_id: propertyIdToUse };
        if (isNaacProvided) duplicateQuery.naac_rank = naacToSave;
        if (isNirfProvided) duplicateQuery.nirf_rank = nirf_rank;
        if (isNbaProvided) duplicateQuery.nba_rank = nba_rank;
        if (isOtherProvided) duplicateQuery.other_ranking = other_ranking;

        const hasFieldChecks = Object.keys(duplicateQuery).some(k => !["_id", "property_id"].includes(k));
        if (hasFieldChecks) {
            const duplicate = await Ranking.findOne(duplicateQuery).lean();
            if (duplicate) {
                return res.status(409).json({
                    error: "Another ranking with the same values already exists for this property.",
                });
            }
        }

        const update = {};
        if (isNaacProvided) update.naac_rank = naacToSave;
        if (isNirfProvided) update.nirf_rank = nirf_rank;
        if (isNbaProvided) update.nba_rank = nba_rank;
        if (isOtherProvided) update.other_ranking = other_ranking;
        if (property_id) update.property_id = property_id;

        const updatedDoc = await Ranking.findByIdAndUpdate(
            objectId,
            { $set: update },
            { new: true, runValidators: true }
        ).lean();

        return res.status(200).json({
            message: "Ranking updated successfully",
            data: updatedDoc,
        });
    } catch (error) {
        console.error("Edit Ranking Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};