
import Comment from "../ask_model/Comment.js";
import RegularUser from "../profile-model/RegularUser.js";
import { getDataFromToken } from "../utils/getDataFromToken.js";

export const getComments = async (req, res) => {
    try {
        const { questionId, answerId } = req.query;

        const filter = {};
        if (questionId) filter.question = questionId;
        if (answerId) filter.answer = answerId;

        const comments = await Comment.find(filter).populate("author", "name").sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCommentsByQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const comments = await Comment.find({ question: questionId })
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        return res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCommentsByAnswer = async (req, res) => {
    try {
        const { answerId } = req.params;
        const comments = await Comment.find({ answer: answerId })
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        return res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createComment = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        const user = await RegularUser.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const { content } = req.body;
        const { questionId, answerId } = req.params;

        const newComment = await Comment({
            content,
            author: user?._id,
            question: questionId || null,
            answer: answerId || null,
        });

        const savedComment = await newComment.save();

        return res.status(201).json({
            message: "Comment added successfully.",
            comment: savedComment
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};