import SeoScore from "../analytic-model/SeoScore.js";

export const addSeoScore = async ({ seo_score, property_id }) => {
  if (seo_score === undefined || seo_score === null || !property_id) {
    throw new Error("All fields are required");
  }

  const existingScore = await SeoScore.findOne({ property_id });

  if (existingScore) {
    existingScore.seo_score = seo_score;
    return await existingScore.save();
  } else {
    const newScore = new SeoScore({
      seo_score,
      property_id,
    });

    return await newScore.save();
  }
};

export const getSeoScoreById = async (req, res) => {
  try {
    const { property_id } = req.params;

    if (!property_id) {
      return res.status(400).json({ error: "Property ID is required" });
    }

    const score = await SeoScore.findOne({ property_id });

    if (!score) {
      return res.status(404).json({ error: "Property score not found" });
    }

    return res.status(200).json(score);
  } catch (error) {
    console.error("Error fetching property score:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
