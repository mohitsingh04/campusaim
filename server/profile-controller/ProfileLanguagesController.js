import ProfileLanguage from "../profile-model/ProfileLanguage.js";
import ProfileLanguagesList from "../profile-model/ProfileLanguagesList.js";
import { addProfileScore } from "./ProfileScoreController.js";

export const AddProfileLanguage = async (req, res) => {
  try {
    const { userId, language, languageId } = req.body;

    if (!userId || (!language && !languageId)) {
      return res.status(400).json({
        error: "userId and either language or languageId is required.",
      });
    }

    let finalLanguageId;

    if (languageId) {
      finalLanguageId = languageId;
    } else if (language) {
      const langLower = language.toLowerCase();

      // Check if language exists in master list
      let existingLanguage = await ProfileLanguagesList.findOne({
        language: langLower,
      });

      if (!existingLanguage) {
        const lastLang = await ProfileLanguagesList.findOne().sort({
          uniqueId: -1,
        });
        const newLangId = lastLang?.uniqueId ? lastLang.uniqueId + 1 : 1;

        const newLanguage = new ProfileLanguagesList({
          uniqueId: newLangId,
          language: langLower,
        });

        await newLanguage.save();
        finalLanguageId = newLangId;
      } else {
        finalLanguageId = existingLanguage.uniqueId;
      }
    }

    if (!finalLanguageId) {
      return res.status(400).json({ error: "Could not resolve language ID." });
    }

    // Check if this is the user's first language
    const existingDoc = await ProfileLanguage.findOne({ userId });
    const isFirstLanguage = !existingDoc || existingDoc.languages?.length === 0;

    // Get or create profile language entry
    const lastProfileLanguage = await ProfileLanguage.findOne().sort({
      uniqueId: -1,
    });
    const newProfileUniqueId = lastProfileLanguage?.uniqueId
      ? lastProfileLanguage.uniqueId + 1
      : 1;

    const updatedDoc = await ProfileLanguage.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          uniqueId: newProfileUniqueId,
        },
        $addToSet: {
          languages: finalLanguageId,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    // Award score only if it was the first language being added
    if (isFirstLanguage && updatedDoc.languages.length === 1) {
      await addProfileScore({ userId, score: 6 });
    }

    return res.status(200).json({ message: "Language added successfully." });
  } catch (error) {
    console.error("Error adding language:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const RemoveProfileLanguage = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const { language } = req.body;

    if (!uniqueId || !language) {
      return res
        .status(400)
        .json({ error: "uniqueId and language are required." });
    }

    const profileLang = await ProfileLanguage.findOne({ uniqueId });

    if (!profileLang) {
      return res.status(404).json({ error: "Profile not found." });
    }

    if (!profileLang.languages.some((item) => item === language)) {
      return res.status(404).json({ error: "Language Not Found" });
    }

    const updatedDoc = await ProfileLanguage.findOneAndUpdate(
      { uniqueId: parseInt(uniqueId) },
      {
        $pull: { languages: language },
      },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ error: "Profile not found after update." });
    }

    // Subtract 6 points if all languages are removed
    if (updatedDoc.languages.length === 0) {
      await addProfileScore({ userId: updatedDoc.userId, score: -6 });
    }

    return res.status(200).json({ message: "Language removed successfully." });
  } catch (error) {
    console.error("Error removing language:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetLanguageByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const languages = await ProfileLanguage.findOne({ userId });
    if (!languages) {
      return res.status(404).json({ error: "languages Not Found" });
    }

    return res.status(200).json(languages);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetLanguagesList = async (req, res) => {
  try {
    const allLanguages = await ProfileLanguagesList.find();

    if (!allLanguages) {
      return res.status(404).json({ error: "No Languages Found" });
    }

    return res.status(200).json(allLanguages);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Update Requirement
export const updateLanguage = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { language } = req.body;

    const languageOutcomes = await ProfileLanguagesList.findById(objectId);

    if (!languageOutcomes) {
      return res.status(404).json({ error: "language Not Found" });
    }

    languageOutcomes.language =
      language?.toLowerCase() || languageOutcomes.language?.toLowerCase();

    await languageOutcomes.save();

    return res.status(200).json({
      message: "language Updated Successfully",
      data: languageOutcomes,
    });
  } catch (error) {
    console.error("Update language Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
