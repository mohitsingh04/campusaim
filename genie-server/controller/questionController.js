import mongoose from "mongoose";
import Question from "../models/question.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import generateSlug from "../utils/generateSlug.js";

export const getQuestionById = async (req, res) => {
    try {
        const { questionId } = req.params;

        // ---------------- VALIDATION ----------------
        if (!mongoose.Types.ObjectId.isValid(questionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid question id",
            });
        }

        // ---------------- AUTH ----------------
        const userId = await getDataFromToken(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // ---------------- FETCH ----------------
        const question = await Question.findById(questionId)
            .select("-__v")
            .lean();

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: question,
        });
    } catch (error) {
        console.error("getQuestionById:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch question",
        });
    }
};

export const getQuestionsByNicheId = async (req, res) => {
    try {
        const { nicheId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(nicheId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid niche id"
            });
        }

        const filter = {
            nicheId: new mongoose.Types.ObjectId(nicheId)
        };

        const search = String(req.query.search || "").trim();

        if (search.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Search query too long"
            });
        }

        if (search) {
            const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            filter.$or = [
                { title: { $regex: safeSearch, $options: "i" } },
                { questionText: { $regex: safeSearch, $options: "i" } },
                { status: { $regex: safeSearch, $options: "i" } }
            ];
        }

        const questions = await Question.find(filter)
            .sort({ order: 1, createdAt: 1 })
            .select("-__v")
            .lean();

        return res.status(200).json({
            success: true,
            data: questions
        });

    } catch (error) {
        console.error("getQuestionsByNicheId:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch questions"
        });
    }
};

export const addQuestions = async (req, res) => {
    try {
        const { nicheId, questions } = req.body;

        const userId = await getDataFromToken(req);
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!mongoose.Types.ObjectId.isValid(nicheId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid nicheId"
            });
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Questions array is required"
            });
        }

        /* ---------------- GET LAST ORDER ---------------- */
        const lastQuestion = await Question.findOne({ nicheId })
            .sort({ order: -1 })
            .select("order")
            .lean();

        let nextOrder = lastQuestion?.order ? lastQuestion.order + 1 : 1;

        const sanitizedQuestions = [];

        for (let index = 0; index < questions.length; index++) {
            const q = questions[index];

            if (!q.title || typeof q.title !== "string") {
                return res.status(400).json({
                    success: false,
                    message: `Invalid title at index ${index}`
                });
            }

            if (!q.questionText || typeof q.questionText !== "string") {
                return res.status(400).json({
                    success: false,
                    message: `Invalid questionText at index ${index}`
                });
            }

            if (!Array.isArray(q.options) || q.options.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: `At least 2 options required at index ${index}`
                });
            }

            const slug = generateSlug(q.title);

            // ✅ DUPLICATE SLUG (per niche)
            const exists = await Question.exists({
                nicheId,
                slug
            });

            if (exists) {
                return res.status(409).json({
                    success: false,
                    message: `Question "${q.title}" already exists`
                });
            }

            /* ---------------- ORDER HANDLING ---------------- */
            let finalOrder;

            if (Number.isInteger(q.order) && q.order > 0) {
                finalOrder = q.order;

                const orderExists = await Question.exists({
                    nicheId,
                    order: finalOrder
                });

                if (orderExists) {
                    return res.status(409).json({
                        success: false,
                        message: `Order ${finalOrder} already exists`,
                        conflictField: "order",
                        conflictValue: finalOrder
                    });
                }
            } else {
                finalOrder = nextOrder++;
            }

            /* ---------------- OPTIONS ---------------- */
            const finalOptions = q.options.map((opt, i) => {
                if (!opt?.label || !opt?.value) {
                    throw new Error(`Invalid option at question ${index}, option ${i}`);
                }

                return {
                    label: String(opt.label).trim(),
                    value: String(opt.value).trim().toLowerCase(),
                    point: Number(opt.point) || 0,
                    action: opt.action || "CONTINUE",
                    jumpTo:
                        opt.action === "JUMP" && Number.isInteger(opt.jumpTo)
                            ? opt.jumpTo
                            : undefined,
                };
            });

            sanitizedQuestions.push({
                nicheId,
                order: finalOrder,
                title: q.title.trim(),
                questionText: q.questionText.trim(),
                slug,
                options: finalOptions,
                createdBy: userId
            });
        }

        const inserted = await Question.insertMany(sanitizedQuestions, {
            ordered: true
        });

        return res.status(201).json({
            success: true,
            count: inserted.length,
            data: inserted
        });

    } catch (error) {
        console.error("addQuestions:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Duplicate question order or slug conflict"
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to add questions"
        });
    }
};

export const updateQuestions = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { title, questionText, options, order, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(questionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid question id",
            });
        }

        const userId = await getDataFromToken(req);
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const updateData = {};

        if (title !== undefined) {
            if (typeof title !== "string" || title.trim().length < 3) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid title",
                });
            }
            updateData.title = title.trim();
            updateData.slug = generateSlug(title);
        }

        if (questionText !== undefined) {
            if (
                typeof questionText !== "string" ||
                questionText.trim().length < 3
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid question text",
                });
            }
            updateData.questionText = questionText.trim();
        }

        if (status !== undefined) {
            const allowedStatus = ["active", "inactive", "pending"];
            if (!allowedStatus.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status value",
                });
            }
            updateData.status = status;
        }

        if (Number.isInteger(order) && order > 0) {
            updateData.order = order;
        }

        if (options !== undefined) {
            if (!Array.isArray(options) || options.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "At least 2 options are required",
                });
            }

            updateData.options = options.map((opt, i) => {
                if (!opt?.label || !opt?.value) {
                    throw new Error(`Invalid option at index ${i}`);
                }

                return {
                    label: String(opt.label).trim(),
                    value: String(opt.value).trim().toLowerCase(),
                    point: Number(opt.point) || 0,
                    action: opt.action || "CONTINUE",
                    jumpTo:
                        opt.action === "JUMP" && Number.isInteger(opt.jumpTo)
                            ? opt.jumpTo
                            : undefined,
                };
            });
        }

        const updated = await Question.findOneAndUpdate(
            {
                _id: questionId,
                createdBy: userId,
            },
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Question updated successfully",
            data: updated,
        });
    } catch (error) {
        console.error("updateQuestions:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Update failed",
        });
    }
};

export const deleteQuestions = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid question ID" });
        }

        const questionId = new mongoose.Types.ObjectId(id);

        const question = await Question.findByIdAndDelete(questionId);
        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }

        return res.status(200).json({
            message: "Question deleted successfully.",
        });
    } catch (err) {
        console.error("Delete Question Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteMultiQuestions = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "No question IDs provided" });
        }

        // Validate ObjectIds
        const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length) {
            return res.status(400).json({
                error: "One or more IDs are invalid",
                invalidIds,
            });
        }

        const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

        // 1. Delete Question
        const result = await Question.deleteMany({
            _id: { $in: objectIds },
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: "No questions found for deletion",
            });
        }

        return res.status(200).json({
            message: `Successfully deleted ${result.deletedCount} question(s) and related data`,
        });
    } catch (err) {
        console.error("Bulk Delete Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};