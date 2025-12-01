import Answer from "../ask_model/Answer.js";
import Notification from "../ask_model/Notification.js";
import Question from "../ask_model/Question.js";
import { downloadImageAndReplaceSrcByProfile } from "../helper/folder-cleaners/EditorImagesController.js";
import RegularUser from "../profile-model/RegularUser.js";
import { getDataFromToken } from "../utils/getDataFromToken.js";
import { Filter } from "bad-words";
import { updateReputation } from "./ReputationController.js";
import Follow from "../ask_model/Follow.js";

const filter = new Filter();

export const getAnswers = async (req, res) => {
    try {
        const answers = await Answer.find().lean();
        res.status(200).json(answers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAnswersByQuestion = async (req, res) => {
    try {
        const answers = await Answer.find({ question: req.params.questionId })
            .populate("author", "name")
            .sort({ createdAt: -1 })
            .lean();

        res.json(answers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAnswersById = async (req, res) => {
    try {
        const { id } = req.params;

        const answers = await Answer.findOne({ _id: id });

        return res.status(200).json(answers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAnswersWithQuestions = async (req, res) => {
    try {
        const answers = await Answer.find()
            .populate("author", "name username") // optional, to get author of answer
            .populate("question", "title slug author") // populate question reference
            .sort({ createdAt: -1 }); // newest first maybe

        res.json(answers);
    } catch (err) {
        console.error("Error fetching answers with questions:", err);
        res.status(500).json({ error: "Server error" });
    }
};

export const createAnswer = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        const user = await RegularUser.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const { content, createdAt, updatedAt } = req.body;
        const { questionId } = req.params;
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ error: "Question not found." });
        }
        const questionDate = question.createdAt;

        if (filter.isProfane(content)) {
            return res.status(400).json({
                error: "Please avoid using abusive or inappropriate words.",
            });
        }

        const existingAnswer = await Answer.findOne({
            question: questionId,
            author: user._id,
        });

        if (existingAnswer) {
            return res.status(400).json({
                error: "You have already answered this question. You can edit your answer instead.",
            });
        }

        let updatedAnswer = content;
        if (content) {
            updatedAnswer = await downloadImageAndReplaceSrcByProfile(
                content,
                user.uniqueId,
            );
        }

        // Ensure both createdAt and updatedAt are set (required in schema)
        const now = new Date();
        const answerCreatedAt = createdAt ? new Date(createdAt) : now;
        const answerUpdatedAt = updatedAt ? new Date(updatedAt) : now;

        // --- DATE CHECK HERE ---
        if (answerCreatedAt < questionDate) {
            return res.status(400).json({
                error: "Answer date cannot be before the question was created.",
            });
        }

        const newAnswer = new Answer({
            content: updatedAnswer,
            question: questionId,
            author: user._id,
            createdAt: answerCreatedAt,
            updatedAt: answerUpdatedAt,
        });

        const savedAnswer = await newAnswer.save();
        await updateReputation(user._id, "POST_ANSWER");

        // --- Notification for followers of this question ---
        try {
            // Find all users following this question
            const questionFollowers = await Follow.find({
                followingType: "Question",
                following: questionId
            }).select("follower");

            const followerIds = questionFollowers
                .map(f => f.follower)
                .filter(followerId => followerId.toString() !== user._id.toString());

            if (followerIds.length > 0) {
                const notificationPayload = followerIds.map(followerId => ({
                    recipient: followerId,
                    sender: user._id,
                    type: "NEW_ANSWER",
                    question: questionId,
                }));

                await Notification.insertMany(notificationPayload);
            }
        } catch (notificationError) {
            console.error("Failed to create notifications:", notificationError);
        }

        return res.status(201).json({
            message: "Answer added successfully.",
            answer: savedAnswer,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateAnswer = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        const user = await RegularUser.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const { content, createdAt, updatedAt } = req.body;
        const { answerId } = req.params;

        // Profanity check using bad-words
        if (filter.isProfane(content)) {
            return res.status(400).json({
                error: "Please avoid using abusive or inappropriate words.",
            });
        }

        // 🔍 Find the answer and verify author
        const answer = await Answer.findOne({ _id: answerId, author: user._id });

        if (!answer) {
            return res.status(404).json({
                error: "Answer not found or you are not authorized to edit this answer.",
            });
        }

        let updatedAnswer = content;
        if (content) {
            updatedAnswer = await downloadImageAndReplaceSrcByProfile(
                content,
                user.uniqueId
            );
        }

        if (updatedAnswer) {
            answer.content = updatedAnswer;
        }

        // Update createdAt and updatedAt if provided
        if (createdAt) answer.createdAt = new Date(createdAt);
        if (updatedAt) answer.updatedAt = new Date(updatedAt);
        else answer.updatedAt = new Date(); // Always update updatedAt to now if not provided

        await answer.save();

        return res.status(200).json({
            message: "Answer updated successfully.",
        });
    } catch (error) {
        console.error("Error updating answer:", error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteAnswer = async (req, res) => {
    try {
        const { answerId } = req.params;
        const userId = await getDataFromToken(req);

        const answer = await Answer.findById(answerId);
        if (!answer) {
            return res.status(404).json({ error: "Answer not found." });
        }

        const user = await RegularUser.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (!answer.author.equals(user._id)) {
            return res.status(403).json({ error: "You don't have permission to delete this answer." });
        }

        await Answer.findByIdAndDelete(answerId);
        await updateReputation(user._id, "DELETE_ANSWER");

        return res.status(200).json({
            message: "Answer and related answers deleted successfully.",
        });

    } catch (error) {
        console.error("Error deleting answer:", error);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
};