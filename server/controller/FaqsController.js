import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import { downloadImageAndReplaceSrc } from "../helper/folder-cleaners/EditorImagesController.js";
import Faqs from "../models/Faqs.js";

export const addFaq = async (req, res) => {
  try {
    const { userId, question, answer, property_id } = req.body;

    if (!userId || !question || !answer || !property_id) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const lastFaq = await Faqs.findOne().sort({ _id: -1 });
    const uniqueId = lastFaq ? lastFaq.uniqueId + 1 : 1;

    let updatedAnswer = answer;
    if (answer) {
      updatedAnswer = await downloadImageAndReplaceSrc(answer, property_id);
    }

    const existFaq = await Faqs.findOne({ question, property_id });
    if (existFaq) {
      return res.status(409).json({ error: "This question already exists!" });
    }

    const faqCount = await Faqs.countDocuments({ property_id });

    const newFaq = new Faqs({
      userId,
      uniqueId,
      question,
      answer: updatedAnswer,
      property_id,
    });

    await newFaq.save();

    if (faqCount === 0) {
      await addPropertyScore({
        property_score: 10,
        property_id,
      });
    }

    return res.status(201).json({ message: "Question added successfully." });
  } catch (err) {
    console.error("Error adding FAQ:", err);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

export const getFaq = async (req, res) => {
  try {
    const faqs = await Faqs.find();

    if (!faqs.length) {
      return res.status(404).json({ message: "No FAQs found." });
    }

    return res.status(200).json(faqs);
  } catch (err) {
    console.error("Error fetching FAQs:", err);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

export const getFaqById = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    if (!uniqueId) {
      return res.status(400).json({ error: "FAQ ID is required!" });
    }

    const faq = await Faqs.findOne({ uniqueId: uniqueId });

    if (!faq) {
      return res.status(404).json({ error: "FAQ not found!" });
    }

    return res.status(200).json(faq);
  } catch (err) {
    console.error("Error fetching FAQ by ID:", err);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

export const getFaqByPropertyId = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return res.status(400).json({ error: "Property ID is required!" });
    }

    const faqs = await Faqs.find({ property_id: propertyId });

    if (!faqs.length) {
      return res
        .status(404)
        .json({ error: "No FAQs found for this property!" });
    }

    return res.status(200).json(faqs);
  } catch (error) {
    console.error("Error fetching FAQs by Property ID:", error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};
export const updateFaq = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const { question, answer, status } = req.body;

    const faq = await Faqs.findOne({ uniqueId: uniqueId });
    let updatedAnswer = answer;
    if (answer) {
      updatedAnswer = await downloadImageAndReplaceSrc(
        answer,
        faq?.property_id
      );
    }

    const updatedFaq = await Faqs.findOneAndUpdate(
      { uniqueId },
      { $set: { question, answer: updatedAnswer, status } },
      { new: true }
    );

    if (!updatedFaq) {
      return res.status(404).json({ error: "FAQ not found." });
    }

    return res
      .status(200)
      .json({ message: "FAQ updated successfully.", faqs: updatedFaq });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    const faq = await Faqs.findOne({ uniqueId });
    if (!faq) {
      return res.status(404).json({ error: "FAQ not found!" });
    }

    const property_id = faq.property_id;

    await Faqs.findOneAndDelete({ uniqueId });

    const remainingFaqs = await Faqs.countDocuments({ property_id });

    if (remainingFaqs === 0) {
      await addPropertyScore({
        property_score: -10,
        property_id,
      });
    }

    return res.status(200).json({ message: "FAQ deleted successfully." });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};
