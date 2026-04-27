import Niche from "../models/niche.js";
import generateSlug from "../utils/generateSlug.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import mongoose from "mongoose";
import RegularUser from "../models/regularUser.js";

export const getNiche = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const search = (req.query.search || "").trim();

        const skip = (page - 1) * limit;

        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { status: { $regex: search, $options: "i" } },
            ];
        }

        const [niche, total] = await Promise.all([
            Niche.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Niche.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: niche,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching niche:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const getNicheOptions = async (req, res) => {
    try {
        const niches = await Niche.find({ status: "active" })
            .select("_id name")
            .sort({ name: 1 })
            .lean();

        res.status(200).json({
            success: true,
            data: niches,
        });
    } catch (error) {
        console.error("getNicheOptions error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to fetch niche options",
        });
    }
};

export const getNicheById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Niche id not find." });
        }

        const niche = await Niche.find(id);
        return res.status(201).json(niche);
    } catch (error) {
        console.error("Error fetching niche by id:", error);
        return res.status(500).json({ error: "Internal Server Error." });
    }
};

export const getNicheBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!slug || typeof slug !== "string") {
            return res.status(400).json({ error: "Slug is required." });
        }

        const niche = await Niche.findOne({ slug });

        if (!niche) {
            return res.status(404).json({ error: "Niche not found." });
        }

        return res.status(200).json(niche);

    } catch (error) {
        console.error("Error fetching niche by slug:", error);
        return res.status(500).json({ error: "Internal Server Error." });
    }
};

export const addNiche = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized." });
        }

        const { name, description } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ error: "Niche name is required." });
        }

        const slug = generateSlug(name);

        // 🚫 Duplicate niche check
        const existingNiche = await Niche.exists({ slug });
        if (existingNiche) {
            return res.status(409).json({
                error: "Niche already exists.",
            });
        }

        const niche = await Niche.create({
            name: name.trim(),
            description,
            slug,
        });

        return res.status(201).json({
            message: "Niche added successfully.",
            niche,
        });
    } catch (error) {
        console.error("Error adding niche:", error);

        // Mongo unique index safety net
        if (error.code === 11000) {
            return res.status(409).json({
                error: "Niche already exists.",
            });
        }

        return res.status(500).json({ error: "Internal Server Error." });
    }
};

export const updateNiche = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid niche ID." });
        }

        const { name, status, description } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ error: "Niche name is required." });
        }

        const updatedNiche = await Niche.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                description: description?.trim() || "",
                status: status ?? "active",
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedNiche) {
            return res.status(404).json({ error: "Niche not found." });
        }

        return res.status(200).json({
            message: "Niche updated successfully.",
            niche: updatedNiche,
        });

    } catch (error) {
        console.error("Error updating niche:", error);
        return res.status(500).json({ error: "Internal Server Error." });
    }
};

export const deleteNiche = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid niche ID." });
        }

        const deletedNiche = await Niche.findByIdAndDelete(id);

        if (!deletedNiche) {
            return res.status(404).json({ error: "Niche not found." });
        }

        return res.status(200).json({
            message: "Niche permanently deleted.",
            niche: deletedNiche,
        });

    } catch (error) {
        console.error("Error deleting niche:", error);
        return res.status(500).json({ error: "Internal Server Error." });
    }
};