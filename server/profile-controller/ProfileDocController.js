import { ProfileResumeMover } from "../helper/folder-cleaners/ProfileImageMover.js";
import ProfileDoc from "../profile-model/ProfileDoc.js";
import { addProfileScore } from "./ProfileScoreController.js";

export const SaveProfileResume = async (req, res) => {
  try {
    const resume = req.files?.resume?.[0]?.filename;
    const { userId } = req.body;

    if (!resume) {
      return res.status(400).json({ error: "No resume file uploaded." });
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (resume.size > MAX_SIZE) {
      return res
        .status(400)
        .json({ error: "Resume file must not exceed 5MB." });
    }

    const isExisting = await ProfileDoc.findOne({ userId });
    if (!isExisting) {
      const lastDoc = await ProfileDoc.findOne().sort({ uniqueId: -1 });
      const uniqueId = lastDoc ? lastDoc?.uniqueId + 1 : 1;

      const newResume = await ProfileDoc({ uniqueId, userId, resume });

      await newResume.save();
      await addProfileScore({ userId, score: 20 });
      await ProfileResumeMover(req, res, userId);
      return res.status(200).json({ message: "Resume is Uploaded" });
    }

    const updatedResume = await ProfileDoc.findOneAndUpdate(
      { userId },
      {
        $set: { resume },
      }
    );

    if (updatedResume) {
      await ProfileResumeMover(req, res, userId);

      return res.status(200).json({ message: `Your Resume is Updated` });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetProfileResumeByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const resume = await ProfileDoc.findOne({ userId });
    if (!resume) {
      return res.status(404).json({ error: "User Not Found" });
    }

    return res.status(200).json(resume);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetProfilesResumeAll = async (req, res) => {
  try {
    const resumes = await ProfileDoc.find();
    if (!resumes) {
      return res.status(404).json({ error: "No Resume Found" });
    }
    return res.status(200).json(resumes);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
