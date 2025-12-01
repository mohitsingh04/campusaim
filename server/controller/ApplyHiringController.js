import ApplyHiring from "../models/ApplyHiring.js";

export const applyForHiring = async (req, res) => {
  try {
    const { userId, hiringId, property_id } = req.body;

    const isApplied = await ApplyHiring.findOne({
      userId,
      hiringId,
      property_id,
    });
    if (isApplied) {
      return res
        .status(400)
        .json({ error: "You are already applied for this job" });
    }

    const lastDoc = await ApplyHiring.findOne().sort({ uniqueId: -1 });
    const uniqueId = lastDoc ? lastDoc?.uniqueId + 1 : 1;

    const newApplication = ApplyHiring({
      uniqueId,
      userId,
      hiringId,
      property_id,
    });

    await newApplication.save();

    return res.status(200).json({ message: "Your Application is Submitted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getApplyHiringByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const applications = await ApplyHiring.find({ userId: userId });
    if (!applications) {
      return res
        .status(404)
        .json({ error: "There Are Not Applications for this User" });
    }

    return res.status(200).json(applications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getApplyHiringByPropertyId = async (req, res) => {
  try {
    const { property_id } = req.params;
    const applications = await ApplyHiring.find({ property_id: property_id });
    if (!applications) {
      return res
        .status(404)
        .json({ error: "There Are Not Applications for this User" });
    }

    return res.status(200).json(applications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
