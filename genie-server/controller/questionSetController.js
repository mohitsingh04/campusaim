import mongoose from "mongoose";
import QuestionSet from "../models/questionSet.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import generateSlug from "../utils/generateSlug.js";
import RegularUser from "../models/regularUser.js";

export const getQuestionSet = async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();
        const filter = {};

        /* ================= SECURITY: ReDoS Mitigation ================= */
        if (search) {
            const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                { title: { $regex: safeSearch, $options: "i" } },
                { isActive: { $regex: safeSearch, $options: "i" } },
            ];
        }

        // Fetch full dataset and stats concurrently
        const [questionSet, nicheStats] = await Promise.all([
            QuestionSet.find(filter)
                .populate("nicheId", "name")
                .sort({ createdAt: -1 })
                .lean(), // Removed skip(), limit(), and redundant countDocuments()

            QuestionSet.aggregate([
                {
                    $lookup: {
                        from: "niches",
                        localField: "nicheId",
                        foreignField: "_id",
                        as: "niche",
                    },
                },
                { $unwind: "$niche" },
                {
                    $group: {
                        _id: "$niche.name",
                        count: { $sum: 1 },
                    },
                },
            ])
        ]);

        return res.status(200).json({
            success: true,
            data: questionSet,
            stats: nicheStats,
        });
    } catch (error) {
        console.error("Error fetching question set:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const getQuestionSetById = async (req, res) => {
    try {
        const { id } = req.params;

        // ---------- VALIDATION ----------
        if (!id) {
            return res.status(400).json({
                error: "Question-Set Id is required.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid Question-Set Id.",
            });
        }

        // ---------- FETCH QUESTION SET ----------
        const questionSet = await QuestionSet.findById(id)
            .populate("nicheId", "name slug status")
            .lean();

        if (!questionSet) {
            return res.status(404).json({
                error: "Question set not found.",
            });
        }

        // ---------- MANUAL USER POPULATE ----------
        let createdBy = null;

        if (
            questionSet.createdBy &&
            mongoose.Types.ObjectId.isValid(questionSet.createdBy)
        ) {
            createdBy = await RegularUser.findById(questionSet.createdBy)
                .select("name email")
                .lean();
        }

        questionSet.createdBy = createdBy;

        // ---------- FILTER + SORT QUESTIONS ----------
        questionSet.questions = (questionSet.questions || [])
            .filter((q) => q.isActive !== false)
            .sort((a, b) => a.order - b.order);

        return res.status(200).json(questionSet);

    } catch (error) {
        console.error("Error fetching question set:", error);

        return res.status(500).json({
            error: "Internal Server Error.",
        });
    }
};

export const getQuestionSetByNicheId = async (req, res) => {
    try {
        const { nicheId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(nicheId)) {
            return res.status(400).json({ success: false, error: "Invalid nicheId" });
        }

        const questions = await QuestionSet.find({ nicheId })
            .sort({ order: 1, createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: questions.length,
            data: questions,
        });
    } catch (error) {
        console.error("getQuestionSetByNicheId:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

export const createQuestionSet = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        if (!userId || !mongoose.isValidObjectId(userId)) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const { nicheId, order, title, questionText, options } = req.body;

        if (!mongoose.isValidObjectId(nicheId)) {
            return res.status(400).json({ message: "Invalid nicheId" });
        }

        if (!Number.isInteger(order) || order < 1) {
            return res.status(400).json({ message: "Order must be a positive integer" });
        }

        if (!title?.trim()) {
            return res.status(400).json({ message: "Title is required" });
        }

        if (!questionText?.trim()) {
            return res.status(400).json({ message: "Question text is required" });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ message: "At least 2 options are required" });
        }

        // 🔍 Check duplicate order per niche (UX validation)
        const existingOrder = await QuestionSet.findOne({ nicheId, order });
        if (existingOrder) {
            return res.status(409).json({
                message: `Order ${order} already exists for this niche`,
            });
        }

        const normalizedSlug = generateSlug(title);

        const questionSet = await QuestionSet.create({
            nicheId,
            order,
            title: title.trim(),
            questionText: questionText.trim(),
            slug: normalizedSlug,
            createdBy: userId,
            options,
        });

        res.status(201).json({
            message: "Question created successfully",
            questionSet,
        });
    } catch (error) {
        // 🔒 Handle Mongo duplicate index error (race-condition safe)
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Order already exists for this niche",
            });
        }

        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const { nicheId, order, title, questionText, options, isActive } = req.body;

        // ---------- VALIDATION ----------
        if (!id) {
            return res.status(400).json({ error: "Question Id is required", });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid Question Id", });
        }

        if (!mongoose.Types.ObjectId.isValid(nicheId)) {
            return res.status(400).json({ error: "Invalid nicheId" });
        }

        if (!Number.isInteger(Number(order)) || Number(order) < 1) {
            return res.status(400).json({ error: "Order must be a positive integer" });
        }

        if (!title?.trim()) {
            return res.status(400).json({ error: "Title is required" });
        }

        if (!questionText?.trim()) {
            return res.status(400).json({ error: "Question text is required" });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ error: "At least 2 options are required" });
        }

        // ---------- DUPLICATE ORDER CHECK ----------
        const duplicateOrder = await QuestionSet.exists({
            _id: { $ne: id },
            nicheId,
            order: Number(order),
        });

        if (duplicateOrder) {
            return res.status(409).json({ error: "Another question already exists with this order in this niche" });
        }

        // ---------- UPDATE ----------
        const updatedQuestion = await QuestionSet.findByIdAndUpdate(
            id,
            {
                $set: {
                    nicheId,
                    order: Number(order),
                    title: title.trim(),
                    questionText: questionText.trim(),
                    isActive: isActive || "pending",

                    options: options.map((o) => ({
                        label: o.label?.trim(),
                        value: o.value?.trim().toLowerCase(),
                        point: Number(o.point) || 0,
                        action: o.action || "CONTINUE",
                    })),
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedQuestion) {
            return res.status(404).json({ error: "Question-Set not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Question updated successfully",
            question: updatedQuestion,
        });
    } catch (error) {
        console.error("Update Question Error:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        await QuestionSet.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Question deleted successfully",
        });
    } catch (error) {
        console.error("Delete Question Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};