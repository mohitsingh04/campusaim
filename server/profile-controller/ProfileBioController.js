import ProfileBio from "../profile-model/ProfileBio.js";
import { addProfileScore } from "./ProfileScoreController.js";

export const addProfileBio = async (req, res) => {
  try {
    const { userId, about, heading } = req.body;

    if (!userId || !about || !heading) {
      return res.status(400).json({ error: "Required field missing." });
    }

    let score = 0;
    const existingBio = await ProfileBio.findOne({ userId });
    const isNewAbout = !existingBio?.about && !!about;
    const isNewHeading = !existingBio?.heading && !!heading;

    if (isNewAbout) score += 2;
    if (isNewHeading) score += 2;

    let uniqueId = existingBio?.uniqueId;
    if (!uniqueId) {
      const lastDoc = await ProfileBio.findOne()
        .sort({ uniqueId: -1 })
        .limit(1);
      const lastUniqueId = lastDoc?.uniqueId || 0;
      uniqueId = lastUniqueId + 1;
    }

    await ProfileBio.findOneAndUpdate(
      { userId: userId },
      {
        $set: {
          about,
          heading,
          uniqueId,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    if (score > 0) {
      await addProfileScore({ userId: userId, score: score });
    }

    return res.status(200).json({ message: "Profile bio saved successfully." });
  } catch (error) {
    console.error("Error saving profile bio:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getProfileBioByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const bio = await ProfileBio.findOne({ userId });
    if (!bio) {
      return res.status(404).json({ error: "Bio Not Found" });
    }

    return res.status(200).json(bio);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
