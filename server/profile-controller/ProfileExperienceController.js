import ProfileExperience from "../profile-model/ProfileExperience.js";
import ProfileProperties from "../profile-model/ProfileProperties.js";
import { addProfileScore } from "./ProfileScoreController.js";

export const AddAndUpdateProfileExperience = async (req, res) => {
  try {
    const {
      uniqueId,
      userId,
      position,
      location,
      property_id,
      property_name,
      currentlyWorking,
      start_date,
      end_date,
    } = req.body;

    if (!userId || !position || !location || !start_date) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided." });
    }

    const experienceData = {
      userId,
      position,
      location,
      start_date,
      currentlyWorking,
    };

    const unsetFields = {};

    if (property_name) {
      let existingProperty = await ProfileProperties.findOne({
        property_name: property_name,
      }).lean();

      let propertyUniqueId;

      if (!existingProperty) {
        const lastProperty = await ProfileProperties.findOne()
          .sort({ uniqueId: -1 })
          .lean();

        propertyUniqueId = lastProperty ? lastProperty.uniqueId + 1 : 1;

        const newProperty = new ProfileProperties({
          uniqueId: propertyUniqueId,
          property_name: property_name.toLowerCase(),
        });

        await newProperty.save();
      } else {
        propertyUniqueId = existingProperty.uniqueId;
      }

      experienceData.property_name_id = propertyUniqueId;
      unsetFields.property_id = "";
    } else if (property_id) {
      experienceData.property_id = property_id;
      unsetFields.property_name_id = "";
    }

    if (currentlyWorking) {
      unsetFields.end_date = "";
    } else if (end_date) {
      experienceData.end_date = end_date;
    }

    // Check if this is a new experience entry
    let isNewEntry = false;

    if (uniqueId) {
      // Update flow
      const updated = await ProfileExperience.findOneAndUpdate(
        { userId, uniqueId },
        {
          $set: experienceData,
          $unset: unsetFields,
        },
        { new: true }
      );

      if (!updated) {
        return res
          .status(404)
          .json({ error: "Experience not found to update." });
      }

      return res.status(200).json({
        message: "Profile experience updated successfully.",
        data: updated,
      });
    } else {
      // Create flow
      isNewEntry = true;

      const lastDoc = await ProfileExperience.findOne({ userId })
        .sort({ uniqueId: -1 })
        .lean();

      const nextUniqueId = lastDoc ? lastDoc.uniqueId + 1 : 1;

      const newExperience = new ProfileExperience({
        ...experienceData,
        uniqueId: nextUniqueId,
      });

      await newExperience.save();

      // Award 20 points only if this is the user's first experience
      if (isNewEntry) {
        const totalExperiences = await ProfileExperience.countDocuments({
          userId,
        });
        if (totalExperiences === 1) {
          await addProfileScore({ userId, score: 20 });
        }
      }

      return res.status(201).json({
        message: "Profile experience created successfully.",
        data: newExperience,
      });
    }
  } catch (error) {
    console.error("Error handling profile experience:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GetExperienceByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const experience = await ProfileExperience.find({ userId });

    return res.status(200).json(experience || []);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const DeleteExperienceById = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    const deletedExperience = await ProfileExperience.findOneAndDelete({
      uniqueId,
    });
    if (!deletedExperience) {
      return res.status(404).json({ error: "Experience Not Found" });
    }

    return res.status(200).json({ message: "Experience Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
