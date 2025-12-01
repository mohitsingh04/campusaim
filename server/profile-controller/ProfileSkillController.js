import ProfileSkills from "../profile-model/ProfileSkills.js";
import ProfileSkillList from "../profile-model/ProfileSkillList.js";
import { addProfileScore } from "./ProfileScoreController.js";

export const AddProfileSkill = async (req, res) => {
  try {
    const { userId, skill, skillId } = req.body;

    if (!userId || (!skill && !skillId)) {
      return res
        .status(400)
        .json({ error: "userId and either skill or skillId is required." });
    }

    let finalSkillId;

    if (skillId) {
      finalSkillId = skillId;
    } else if (skill) {
      const skillLower = skill.toLowerCase();

      let existingSkill = await ProfileSkillList.findOne({ skill: skillLower });

      if (!existingSkill) {
        const lastSkill = await ProfileSkillList.findOne().sort({
          uniqueId: -1,
        });
        const newSkillId = lastSkill?.uniqueId ? lastSkill.uniqueId + 1 : 1;

        const newSkill = new ProfileSkillList({
          uniqueId: newSkillId,
          skill: skillLower,
        });

        await newSkill.save();
        finalSkillId = newSkillId;
      } else {
        finalSkillId = existingSkill.uniqueId;
      }
    }

    if (!finalSkillId) {
      return res.status(400).json({ error: "Could not resolve skill ID." });
    }

    // 👉 Check if the user already has skills or not
    const existingUserSkills = await ProfileSkills.findOne({ userId });
    const isFirstSkill =
      !existingUserSkills ||
      (Array.isArray(existingUserSkills.skills) &&
        existingUserSkills.skills.length === 0);

    const lastProfileSkills = await ProfileSkills.findOne().sort({
      uniqueId: -1,
    });
    const newProfileUniqueId = lastProfileSkills?.uniqueId
      ? lastProfileSkills.uniqueId + 1
      : 1;

    await ProfileSkills.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          uniqueId: newProfileUniqueId,
        },
        $addToSet: {
          skills: finalSkillId,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    // ✅ Give score only when adding the very first skill
    if (isFirstSkill) {
      await addProfileScore({ userId, score: 6 });
    }

    return res.status(200).json({ message: "Skill added successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const RemoveProfileSkill = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const { skill } = req.body;

    if (!uniqueId || !skill) {
      return res
        .status(400)
        .json({ error: "uniqueId and skill are required." });
    }

    const profileSkill = await ProfileSkills.findOne({ uniqueId });

    if (!profileSkill) {
      return res.status(404).json({ error: "Profile not found." });
    }

    if (!profileSkill.skills.some((item) => item === skill)) {
      return res.status(404).json({ error: "Skill Not Found" });
    }

    const updatedDoc = await ProfileSkills.findOneAndUpdate(
      { uniqueId: parseInt(uniqueId) },
      {
        $pull: { skills: skill },
      },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ error: "Profile not found after update." });
    }

    // Subtract 6 points if all skills are removed
    if (updatedDoc.skills.length === 0) {
      await addProfileScore({ userId: updatedDoc.userId, score: -6 });
    }

    return res.status(200).json({ message: "Skill removed successfully." });
  } catch (error) {
    console.error("Error removing skill:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetSkillsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const skills = await ProfileSkills.findOne({ userId });
    if (!skills) {
      return res.status(404).json({ error: "Skills Not Found" });
    }

    return res.status(200).json(skills);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const GetSkillList = async (req, res) => {
  try {
    const allSkill = await ProfileSkillList.find();

    if (allSkill.length === 0) {
      return res.status(404).json({ error: "No Skill Found" });
    }

    return res.status(200).json(allSkill);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Update Requirement
export const updateSkill = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { skill } = req.body;

    const skillsOutcomes = await ProfileSkillList.findById(objectId);

    if (!skillsOutcomes) {
      return res.status(404).json({ error: "Skill Not Found" });
    }

    skillsOutcomes.skill =
      skill?.toLowerCase() || skillsOutcomes.skill?.toLowerCase();

    await skillsOutcomes.save();

    return res.status(200).json({
      message: "Skill Updated Successfully",
      data: skillsOutcomes,
    });
  } catch (error) {
    console.error("Update Skill Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
