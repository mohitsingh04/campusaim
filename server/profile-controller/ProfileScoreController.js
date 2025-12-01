import ProfileScore from "../profile-model/ProfileScore.js";

export const addProfileScore = async ({ userId, score }) => {
  try {
    if ((!score, !userId)) {
      throw new Error("All Fields are required");
    }

    const existingScore = await ProfileScore.findOne({ userId });

    if (existingScore) {
      existingScore.score += score;
      await existingScore.save();
    } else {
      const lastScore = await ProfileScore.findOne().sort({ uniqueId: -1 });
      const uniqueId = lastScore ? lastScore.uniqueId + 1 : 1;
      const newScore = new ProfileScore({
        uniqueId,
        score,
        userId,
      });

      await newScore.save();
    }
  } catch (error) {
    console.error("Error adding property score:", error);
    throw new Error("Internal Server Error");
  }
};

export const getProfileScoreById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "UserId Is Required" });
    }

    const profileScore = await ProfileScore.findOne({ userId });

    if (!profileScore) {
      return res.status(404).json({ error: "Profile Score Not Found" });
    }

    return res.status(200).json(profileScore);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
