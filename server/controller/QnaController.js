import mongoose from "mongoose";
import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import { downloadImageAndReplaceSrc } from "../helper/folder-cleaners/EditorImagesController.js";
import QnA from "../models/QnA.js";

const toObjectId = (id) => {
    if (!id) return null;
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return new mongoose.Types.ObjectId(id);
};

export const getQnA = async (req, res) => {
    try {
        const qna = await QnA.find();
        if (!qna.length) {
            return res.status(404).json({ message: "No QnA found." });
        }
        return res.status(200).json(qna);
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error!" });
    }
};

export const getQnAById = async (req, res) => {
    try {
        const { objectId } = req.params;
        if (!objectId || !mongoose.Types.ObjectId.isValid(objectId)) {
            return res.status(400).json({ error: "QnA ID is required and must be valid!" });
        }
        const qna = await QnA.findById(objectId);
        if (!qna) {
            return res.status(404).json({ error: "QnA not found!" });
        }
        return res.status(200).json(qna);
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error!" });
    }
};

export const getQnAByPropertyId = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const propIdObj = toObjectId(propertyId);
        if (!propIdObj) {
            return res.status(400).json({ error: "Property ID is required and must be valid!" });
        }
        const qna = await QnA.find({ property_id: propIdObj });
        if (!qna.length) {
            return res.status(404).json({ error: "No QnA found for this property!" });
        }
        return res.status(200).json(qna);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error!" });
    }
};

export const addQnA = async (req, res) => {
    try {
        const { userId, question, answer, property_id } = req.body;
        if (!userId || !question || !answer || !property_id) {
            return res.status(400).json({ error: "All fields are required!" });
        }
        const propIdObj = toObjectId(property_id);
        if (!propIdObj) {
            return res.status(400).json({ error: "Invalid property_id" });
        }

        let updatedAnswer = answer;
        if (answer) {
            updatedAnswer = await downloadImageAndReplaceSrc(answer, propIdObj.toString());
        }

        const existQnA = await QnA.findOne({ question, property_id: propIdObj });
        if (existQnA) {
            return res.status(409).json({ error: "This question already exists!" });
        }

        const qnaCount = await QnA.countDocuments({ property_id: propIdObj });

        const newQnA = new QnA({
            userId,
            question,
            answer: updatedAnswer,
            property_id: propIdObj,
        });

        await newQnA.save();

        if (qnaCount === 0) {
            await addPropertyScore({
                property_score: 10,
                property_id: propIdObj.toString(),
            });
        }

        return res.status(201).json({ message: "Question added successfully." });
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error!" });
    }
};

export const updateQnA = async (req, res) => {
    try {
        const { objectId } = req.params;
        if (!objectId || !mongoose.Types.ObjectId.isValid(objectId)) {
            return res.status(400).json({ error: "QnA ID is required and must be valid!" });
        }

        const { question, answer, status } = req.body;
        const qna = await QnA.findById(objectId);
        if (!qna) {
            return res.status(404).json({ error: "QnA not found." });
        }

        let updatedAnswer = answer;
        if (answer) {
            updatedAnswer = await downloadImageAndReplaceSrc(answer, String(qna.property_id));
        }

        const updatedQnA = await QnA.findByIdAndUpdate(
            objectId,
            { $set: { question, answer: updatedAnswer, status } },
            { new: true, runValidators: true }
        );

        if (!updatedQnA) {
            return res.status(404).json({ error: "QnA not found." });
        }

        return res.status(200).json({ message: "QnA updated successfully.", qna: updatedQnA });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error!" });
    }
};

export const deleteQnA = async (req, res) => {
    try {
        const { objectId } = req.params;
        if (!objectId || !mongoose.Types.ObjectId.isValid(objectId)) {
            return res.status(400).json({ error: "QnA ID is required and must be valid!" });
        }

        const qna = await QnA.findById(objectId);
        if (!qna) {
            return res.status(404).json({ error: "QnA not found!" });
        }

        const property_id = qna.property_id;
        await QnA.findByIdAndDelete(objectId);

        const remainingQnA = await QnA.countDocuments({ property_id });
        if (remainingQnA === 0) {
            await addPropertyScore({
                property_score: -10,
                property_id: String(property_id),
            });
        }

        return res.status(200).json({ message: "QnA deleted successfully." });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error!" });
    }
};
