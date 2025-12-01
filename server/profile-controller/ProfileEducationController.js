import ProfileEducation from "../profile-model/ProfileEducation.js";
import ProfileInstitutes from "../profile-model/ProfileInstitutes.js";
import ProfileDegree from "../profile-model/ProfileDegree.js";
import { addProfileScore } from "./ProfileScoreController.js"; // adjust path

export const AddAndUpdateProfileEducation = async (req, res) => {
  try {
    const {
      uniqueId,
      degree,
      degreeId,
      institute,
      instituteId,
      start_date,
      end_date,
      currentlyStuding,
      userId,
    } = req.body;

    let finalDegreeId = degreeId;
    let finalInstituteId = instituteId;

    if (!degreeId && degree) {
      const existingDegree = await ProfileDegree.findOne({
        degree_name: { $regex: new RegExp(`^${degree}$`, "i") },
      });

      if (existingDegree) {
        finalDegreeId = existingDegree.uniqueId;
      } else {
        const lastDegree = await ProfileDegree.findOne().sort({ uniqueId: -1 });
        finalDegreeId = lastDegree ? lastDegree.uniqueId + 1 : 1;

        await ProfileDegree.create({
          uniqueId: finalDegreeId,
          degree_name: degree.toLowerCase(),
        });
      }
    }

    if (!instituteId && institute) {
      const existingInstitute = await ProfileInstitutes.findOne({
        institute_name: { $regex: new RegExp(`^${institute}$`, "i") },
      });

      if (existingInstitute) {
        finalInstituteId = existingInstitute.uniqueId;
      } else {
        const lastInstitute = await ProfileInstitutes.findOne().sort({
          uniqueId: -1,
        });
        finalInstituteId = lastInstitute ? lastInstitute.uniqueId + 1 : 1;

        await ProfileInstitutes.create({
          uniqueId: finalInstituteId,
          institute_name: institute.toLowerCase(),
        });
      }
    }

    const duplicate = await ProfileEducation.findOne({
      userId,
      degree: finalDegreeId,
      institute: finalInstituteId,
      uniqueId: { $ne: uniqueId }, // Exclude current doc if updating
    });

    if (duplicate) {
      return res.status(400).json({
        error:
          "This degree already exists for the same institute for this user.",
      });
    }

    const educationData = {
      userId,
      degree: finalDegreeId,
      institute: finalInstituteId,
      start_date,
      currentlyStuding: !!currentlyStuding,
      end_date: currentlyStuding ? null : end_date || null,
    };

    let finalUniqueId = uniqueId;
    let isNewEntry = false;

    if (!finalUniqueId) {
      const lastEdu = await ProfileEducation.findOne().sort({ uniqueId: -1 });
      finalUniqueId = lastEdu ? lastEdu.uniqueId + 1 : 1;
      isNewEntry = true;
    }
    educationData.uniqueId = finalUniqueId;

    const result = await ProfileEducation.findOneAndUpdate(
      { userId, uniqueId: finalUniqueId },
      { $set: educationData },
      { upsert: true, new: true }
    );

    // Check if this is the FIRST education ever for this user, only then award points
    if (isNewEntry) {
      const totalEducations = await ProfileEducation.countDocuments({ userId });
      if (totalEducations === 1) {
        await addProfileScore({ userId, score: 20 });
      }
    }

    return res.status(200).json({
      message: "Profile education saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in AddAndUpdateProfileEducation:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetEducationByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const education = await ProfileEducation.find({ userId });
    if (!education) {
      return res.status(404).json({ error: "No education Found" });
    }

    return res.status(200).json(education);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetAllProfieDegree = async (req, res) => {
  try {
    const degree = await ProfileDegree.find();
    if (!degree) {
      return res.status(404).json({ error: "No Degree Found" });
    }

    return res.status(200).json(degree);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const GetAllProfieInstitute = async (req, res) => {
  try {
    const institute = await ProfileInstitutes.find();
    if (!institute) {
      return res.status(404).json({ error: "No Institute Found" });
    }

    return res.status(200).json(institute);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const DeleteEducationById = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    const deletedEducation = await ProfileEducation.findOneAndDelete({
      uniqueId,
    });
    if (!deletedEducation) {
      return res.status(404).json({ error: "Experience Not Found" });
    }

    return res.status(200).json({ message: "Experience Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
