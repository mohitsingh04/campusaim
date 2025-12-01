import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import Amenities from "../models/Ameniteis.js";

export const getAmenities = async (req, res) => {
  try {
    const amenities = await Amenities.find();

    if (!amenities || amenities.length === 0) {
      return res.status(404).json({ message: "No amenities found." });
    }

    return res.status(200).json(amenities);
  } catch (error) {
    console.error("Error fetching amenities:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getAmenitiesByPropertyId = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return res.status(400).json({ error: "Property ID is required." });
    }

    const amenities = await Amenities.findOne({ propertyId });

    if (!amenities) {
      return res
        .status(404)
        .json({ message: "No amenities found for this property." });
    }

    return res.status(200).json(amenities);
  } catch (error) {
    console.error("Error fetching amenities by propertyId:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const addAmenities = async (req, res) => {
  try {
    const { propertyId, selectedAmenities } = req.body;

    if (!propertyId) {
      return res.status(400).json({ error: "Property ID is required." });
    }

    if (
      !selectedAmenities ||
      typeof selectedAmenities !== "object" ||
      Object.keys(selectedAmenities).length === 0
    ) {
      return res
        .status(400)
        .json({ error: "At least one amenity must be selected." });
    }

    const amenitiesExists = await Amenities.findOne({ propertyId });
    if (amenitiesExists) {
      return res
        .status(409)
        .json({ error: "Amenities already exist for this property." });
    }

    const lastAmenity = await Amenities.findOne().sort({ uniqueId: -1 });
    const nextUniqueId = lastAmenity ? lastAmenity.uniqueId + 1 : 1;

    const newAmenities = new Amenities({
      uniqueId: nextUniqueId,
      propertyId,
      selectedAmenities,
    });

    await newAmenities.save();

    await addPropertyScore({
      property_id: propertyId,
      property_score: 10,
    });

    return res.status(201).json({
      message: "Amenities added successfully.",
      data: newAmenities,
    });
  } catch (error) {
    console.error("Error adding amenities:", error);
    return res.status(500).json({
      error: "Failed to add amenities.",
      details: error.message,
    });
  }
};

export const updateAmenities = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    if (!uniqueId) {
      return res.status(400).json({ error: "Amenities ID is required!" });
    }

    const amenitiesId = await Amenities.findOne({ uniqueId });
    if (!amenitiesId) {
      return res.status(404).json({ error: "Amenities not found!" });
    }

    const { propertyId, selectedAmenities } = req.body;

    const updatedAmenities = await Amenities.findOneAndUpdate(
      { uniqueId },
      {
        $set: {
          propertyId,
          selectedAmenities,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Updated successfully.", updatedAmenities });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to create amenities",
      details: error.message,
    });
  }
};
