import mongoose from "mongoose";
import ExamEligibility from "../models/ExamEligiblity.js";

export const createExamEligibility = async (req, res) => {
  try {
    const {
      exam_id,
      min_age,
      max_age,
      std_class,
      pursuing_class,
      percentage,
      streams,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(exam_id)) {
      return res.status(400).json({ message: "Invalid exam id" });
    }

    const minAgeInMonths =
      Number(min_age?.year || 0) * 12 + Number(min_age?.month || 0);

    const maxAgeInMonths =
      Number(max_age?.year || 0) * 12 + Number(max_age?.month || 0);

    if (minAgeInMonths >= maxAgeInMonths) {
      return res
        .status(400)
        .json({ message: "Minimum age must be less than maximum age" });
    }

    if (streams && !Array.isArray(streams)) {
      return res.status(400).json({ message: "Streams must be an array" });
    }

    await ExamEligibility.findOneAndUpdate(
      { exam_id },
      {
        exam_id,
        min_age,
        max_age,
        std_class,
        pursuing_class,
        percentage,
        streams,
      },
      { new: true, upsert: true, runValidators: true },
    );

    return res.status(200).json({ message: "Eligibility saved successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getExamEligibility = async (req, res) => {
  try {
    const { exam_id } = req.params;

    if (!exam_id) {
      return res.status(400).json({ message: "Exam id is required" });
    }

    const eligibility = await ExamEligibility.findOne({ exam_id }).populate(
      "exam_id",
    );

    if (!eligibility) {
      return res.status(404).json({ message: "Eligibility not found" });
    }

    return res.status(200).json(eligibility);
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};
