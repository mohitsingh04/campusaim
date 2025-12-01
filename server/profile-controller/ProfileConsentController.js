import ProfileConsent from "../profile-model/ProfileContsents.js";
import { getUserDataFromToken } from "../utils/getDataFromToken.js";

export const setUserConsent = async (req, res) => {
  try {
    const { consent } = req.body;
    const userId = await getUserDataFromToken(req);

    if (!userId || typeof consent !== "boolean") {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Update existing consent or create new
    await ProfileConsent.findOneAndUpdate(
      { userId },
      { consent },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: "Consent updated successfully",
    });
  } catch (error) {
    console.error("Error in setUserConsent:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getUserConsent = async (req, res) => {
  try {
    const { userId } = req.params;

    const consentData = await ProfileConsent.findOne({ userId });

    if (!consentData) {
      return res.status(404).json({
        success: false,
        message: "Consent record not found for this user",
      });
    }

    res.status(200).json(consentData);
  } catch (error) {
    console.error("Error in getUserConsent:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
