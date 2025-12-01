import PropertyRetreat from "../models/PropertyRetreat.js";
import Retreat from "../models/Retreat.js";
import { downloadImageAndReplaceSrc } from "../helper/folder-cleaners/EditorImagesController.js";
import { RetreatImageMover } from "../helper/folder-cleaners/PropertyImageMover.js";
import Property from "../models/Property.js";

export const addPropertyRetreat = async (req, res) => {
  try {
    const {
      property_id,
      retreat_id,
      retreat_short_name,
      retreat_type,
      retreat_format,
      retreat_difficulty_level,
      retreat_certification_type,
      capacity,
      cancellation_policy,
      duration,
      certification_available,
      requirements,
      key_outcomes,
      best_for,
      languages,
      price,
      booking_deadline,
      start_date,
      end_date,
      accommodation,
      inclusions,
      exclusions,
      routine,
      description,
    } = req.body;

    if (!property_id || !retreat_id) {
      return res
        .status(400)
        .json({ error: "property_id and retreat_id are required." });
    }

    // Check if mapping already exists
    const existing = await PropertyRetreat.findOne({ property_id, retreat_id });
    if (existing) {
      return res
        .status(400)
        .json({ error: "This retreat is already mapped to this property." });
    }

    // Fetch base retreat
    const baseRetreat = await Retreat.findOne({
      _id: retreat_id,
      isDeleted: false,
    });
    if (!baseRetreat) {
      return res.status(404).json({ error: "Retreat not found." });
    }

    // Generate next uniqueId
    const lastDoc = await PropertyRetreat.findOne().sort({ uniqueId: -1 });
    const nextUniqueId = lastDoc ? lastDoc.uniqueId + 1 : 1;

    // Handle arrays if sent as JSON strings
    const parseJSON = (value) => {
      try {
        return typeof value === "string" ? JSON.parse(value) : value;
      } catch {
        return value || [];
      }
    };

    const retreat_image =
      req.files?.["featured_image"]?.[0]?.webpFilename || "";
    const retreat_original_image =
      req.files?.["featured_image"]?.[0]?.filename || "";

    const propertyDetails = await Property.findById(property_id);
    // Process rich-text fields with image replacement
    let processedCancellationPolicy = cancellation_policy
      ? await downloadImageAndReplaceSrc(
          cancellation_policy,
          propertyDetails?.uniqueId
        )
      : cancellation_policy;

    let processedInclusions = inclusions
      ? await downloadImageAndReplaceSrc(inclusions, propertyDetails?.uniqueId)
      : inclusions;

    let processedExclusions = exclusions
      ? await downloadImageAndReplaceSrc(exclusions, propertyDetails?.uniqueId)
      : exclusions;

    let processedDescription = description
      ? await downloadImageAndReplaceSrc(description, propertyDetails?.uniqueId)
      : description;

    // Prepare payload
    const payload = {
      uniqueId: nextUniqueId,
      property_id,
      retreat_id,
      status: "Active",
      retreat_format,
      retreat_difficulty_level,
      retreat_certification_type,
      capacity,
      cancellation_policy: processedCancellationPolicy,
      certification_available:
        certification_available === "true" || certification_available === true,
      requirements: parseJSON(requirements),
      key_outcomes: parseJSON(key_outcomes),
      best_for: parseJSON(best_for),
      languages: parseJSON(languages),
      price: parseJSON(price),
      booking_deadline,
      start_date,
      end_date,
      accommodation: parseJSON(accommodation),
      featured_image: [retreat_image, retreat_original_image],
      inclusions: processedInclusions,
      exclusions: processedExclusions,
      routine: parseJSON(routine),
      description: processedDescription,
    };

    // Only override specific fields if different from base retreat
    if (
      typeof retreat_short_name !== "undefined" &&
      retreat_short_name !== baseRetreat.retreat_short_name
    ) {
      payload.retreat_short_name = retreat_short_name;
    }
    if (
      typeof retreat_type !== "undefined" &&
      retreat_type !== baseRetreat.retreat_type
    ) {
      payload.retreat_type = retreat_type;
    }
    if (typeof duration !== "undefined" && duration !== baseRetreat.duration) {
      payload.duration = duration;
    }
    if (
      typeof description !== "undefined" &&
      description !== baseRetreat.description
    ) {
      payload.description = processedDescription;
    }

    const newPropertyRetreat = new PropertyRetreat(payload);
    await newPropertyRetreat.save();

    RetreatImageMover(req, res, property_id);

    return res.status(200).json({
      message: "Property retreat added successfully.",
      data: newPropertyRetreat,
    });
  } catch (error) {
    console.error("Error adding property retreat:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getRetreatByPropertyId = async (req, res) => {
  try {
    const { property_id } = req.params;
    const retreats = await PropertyRetreat.find({ property_id: property_id });
    return res.status(200).json(retreats);
  } catch (error) {
    console.log(error);
  }
};
export const updatePropertyRetreat = async (req, res) => {
  try {
    const { objectId } = req.params;

    if (!objectId) {
      return res.status(400).json({ error: "Invalid PropertyRetreat ID." });
    }

    // Find existing property retreat
    const propertyRetreatDoc = await PropertyRetreat.findById(objectId);
    if (!propertyRetreatDoc) {
      return res.status(404).json({ error: "Property retreat not found." });
    }

    // Fetch base retreat for comparison
    const baseRetreat = await Retreat.findOne({
      _id: propertyRetreatDoc.retreat_id,
      isDeleted: false,
    });
    if (!baseRetreat) {
      return res.status(404).json({ error: "Base retreat not found." });
    }

    // Helper for parsing JSON strings
    const parseJSON = (value) => {
      try {
        return typeof value === "string" ? JSON.parse(value) : value;
      } catch {
        return value || [];
      }
    };

    const {
      retreat_short_name,
      retreat_type,
      duration,
      description,
      retreat_format,
      retreat_difficulty_level,
      retreat_certification_type,
      capacity,
      cancellation_policy,
      certification_available,
      requirements,
      key_outcomes,
      best_for,
      languages,
      price,
      booking_deadline,
      start_date,
      end_date,
      accommodation,
      inclusions,
      exclusions,
      routine,
      status,
    } = req.body;

    const propertyDetails = await Property.findById(
      propertyRetreatDoc.property_id
    );
    let processedCancellationPolicy = cancellation_policy
      ? await downloadImageAndReplaceSrc(
          cancellation_policy,
          propertyDetails?.uniqueId
        )
      : cancellation_policy;

    let processedInclusions = inclusions
      ? await downloadImageAndReplaceSrc(inclusions, propertyDetails?.uniqueId)
      : inclusions;

    let processedExclusions = exclusions
      ? await downloadImageAndReplaceSrc(exclusions, propertyDetails?.uniqueId)
      : exclusions;

    let processedDescription = description
      ? await downloadImageAndReplaceSrc(description, propertyDetails?.uniqueId)
      : description;

    const updateFields = {
      retreat_format,
      retreat_difficulty_level,
      retreat_certification_type,
      capacity,
      cancellation_policy: processedCancellationPolicy,
      certification_available:
        certification_available === "true" || certification_available === true,
      requirements: parseJSON(requirements),
      key_outcomes: parseJSON(key_outcomes),
      best_for: parseJSON(best_for),
      languages: parseJSON(languages),
      price: parseJSON(price),
      booking_deadline,
      start_date,
      end_date,
      accommodation: parseJSON(accommodation),
      inclusions: processedInclusions,
      exclusions: processedExclusions,
      routine: parseJSON(routine),
    };

    // Only override specific fields if different from base retreat
    if (
      typeof retreat_short_name !== "undefined" &&
      retreat_short_name !== baseRetreat.retreat_short_name
    ) {
      updateFields.retreat_short_name = retreat_short_name;
    }
    if (
      typeof retreat_type !== "undefined" &&
      retreat_type !== baseRetreat.retreat_type
    ) {
      updateFields.retreat_type = retreat_type;
    }
    if (typeof duration !== "undefined" && duration !== baseRetreat.duration) {
      updateFields.duration = duration;
    }
    if (
      typeof description !== "undefined" &&
      description !== baseRetreat.description
    ) {
      updateFields.description = processedDescription;
    }

    // Always allow status update
    if (typeof status !== "undefined") {
      updateFields.status = status;
    }

    // Handle image update if provided
    const retreat_image =
      req.files?.["featured_image"]?.[0]?.webpFilename || "";
    const retreat_original_image =
      req.files?.["featured_image"]?.[0]?.filename || "";

    if (retreat_image || retreat_original_image) {
      updateFields.featured_image = [
        retreat_image || propertyRetreatDoc.featured_image?.[0] || "",
        retreat_original_image || propertyRetreatDoc.featured_image?.[1] || "",
      ];
    }

    // Apply update
    const updatedDoc = await PropertyRetreat.findByIdAndUpdate(
      objectId,
      { $set: updateFields },
      { new: true }
    );

    RetreatImageMover(req, res, propertyRetreatDoc.property_id);

    return res.status(200).json({
      message: "Property retreat updated successfully.",
      data: updatedDoc,
    });
  } catch (error) {
    console.error("Error updating property retreat:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const deletePropertyRetreat = async (req, res) => {
  try {
    const { objectId } = req.params;

    const deletedRetreat = await PropertyRetreat.findOneAndDelete({
      _id: objectId,
    });

    if (!deletedRetreat) {
      return res.status(404).json({ error: "Retreat Not Found" });
    }

    return res.status(200).json({ message: "Retreat Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
