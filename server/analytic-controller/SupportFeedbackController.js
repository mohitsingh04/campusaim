import SupportFeedback from "../analytic-model/SupportFeedback.js";

export const giveSupportFeedback = async (req, res) => {
  try {
    const { feedback, userId, supportId, supportUserId } = req.body;

    if (!feedback || !userId || !supportId || !supportUserId) {
      return res.status(400).json({
        error: "feedback, userId,supportUserId, and supportId are required",
      });
    }

    const existingFeedback = await SupportFeedback.findOne({
      userId,
      supportId,
      supportUserId,
    });

    if (existingFeedback) {
      return res.status(400).json({
        message: "You have already submitted feedback for this support chat.",
      });
    }

    const newFeedback = new SupportFeedback({
      feedback,
      userId,
      supportId,
      supportUserId,
    });

    await newFeedback.save();

    return res.status(201).json({
      success: true,
      message: "Thank you for your feedback!",
      data: newFeedback,
    });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSupportFeedbackBySupportId = async (req, res) => {
  try {
    const { supportId } = req.params;

    if (!supportId) {
      return res.status(400).json({ error: "supportId is required" });
    }

    const feedbacks = await SupportFeedback.findOne({ supportId });

    if (!feedbacks) {
      return res
        .status(404)
        .json({ message: "No feedback found for this support chat" });
    }

    return res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
