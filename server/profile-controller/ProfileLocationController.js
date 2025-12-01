import ProfileLocation from "../profile-model/ProfileLocation.js";
import { addProfileScore } from "./ProfileScoreController.js";

export const addProfileLocation = async (req, res) => {
  try {
    const { userId, address, pincode, city, state, country } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required." });
    }

    const existingLocation = await ProfileLocation.findOne({ userId });

    let score = 0;

    if (!existingLocation?.address && address) score += 2;
    if (!existingLocation?.pincode && pincode) score += 2;
    if (!existingLocation?.city && city) score += 2;
    if (!existingLocation?.state && state) score += 2;
    if (!existingLocation?.country && country) score += 2;

    const updatedLocation = await ProfileLocation.findOneAndUpdate(
      { userId },
      {
        $set: {
          address,
          pincode,
          city,
          state,
          country,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    if (score > 0) {
      await addProfileScore({ userId, score });
    }

    return res.status(200).json({
      message: "Profile location saved successfully.",
      data: updatedLocation,
    });
  } catch (error) {
    console.error("Error saving profile location:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getLocationByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const location = await ProfileLocation.findOne({ userId });
    if (!location) {
      return res.status(404).json({ error: "Location Not Found" });
    }

    return res.status(200).json(location);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
