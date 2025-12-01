import Feedback from "../analytic-model/Feedback.js";

export const giveFeedback = async (req, res) => {
  try {
    const { userId, reaction, message } = req.body;

    if (!userId || !reaction) {
      return res
        .status(400)
        .json({ error: "userId and reaction are required" });
    }

    const lastFeedback = await Feedback.findOne().sort({ uniqueId: -1 });
    const newUniqueId = lastFeedback ? lastFeedback.uniqueId + 1 : 1;

    const feedback = await Feedback.findOneAndUpdate(
      { userId },
      {
        $set: { reaction, message },
        $setOnInsert: { uniqueId: newUniqueId, userId },
      },
      { new: true, upsert: true }
    );

    const messageText = feedback
      ? "Feedback updated successfully"
      : "Feedback submitted successfully";

    return res.status(200).json({
      message: messageText,
      data: feedback,
    });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    return res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteFeedbackById = async (req, res) => {
  try {
    const { objectId } = req.params;
    console.log(objectId);

    const feedback = await Feedback.findByIdAndDelete(objectId);

    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    return res.status(200).json({
      message: "Feedback deleted successfully",
      deleted: feedback,
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getFeedbackById = async (req, res) => {
  try {
    const { objectId } = req.params;

    const feedback = await Feedback.findById(objectId);

    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    return res.status(200).json(feedback);
  } catch (error) {
    console.error("Error fetching feedback by ID:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getFeedbackByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const feedback = await Feedback.findOne({ userId });

    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    return res.status(200).json(feedback);
  } catch (error) {
    console.error("Error fetching feedback by ID:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const UpdateStatusByObjectId = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { status } = req.body;

    // Validate ObjectId format
    if (!objectId) {
      return res.status(400).json({ error: "ObjectId is Required" });
    }

    // Validate status field
    if (!status) {
      return res
        .status(400)
        .json({ error: "Status is required and must be a string" });
    }

    // Find and update the status
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      objectId,
      { status },
      { new: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    return res.status(200).json({
      message: "Feedback status updated successfully",
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error("Error updating feedback status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
