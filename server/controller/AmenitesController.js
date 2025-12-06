import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import Amenities from "../models/Ameniteis.js";
import mongoose from "mongoose";

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

    const newAmenities = new Amenities({
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
    const { objectId } = req.params;

    if (!objectId || !mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ error: "Invalid Amenities ID!" });
    }

    const existingAmenities = await Amenities.findById(objectId);
    if (!existingAmenities) {
      return res.status(404).json({ error: "Amenities not found!" });
    }

    const { propertyId, selectedAmenities } = req.body;

    const updateData = {
      propertyId: propertyId ?? existingAmenities.propertyId,
      selectedAmenities: selectedAmenities ?? existingAmenities.selectedAmenities,
    };

    const updatedAmenities = await Amenities.findByIdAndUpdate(
      objectId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Amenities updated successfully.",
      updatedAmenities,
    });
  } catch (error) {
    console.error("Update Amenities Error:", error);
    return res.status(500).json({
      error: "Failed to update amenities",
      details: error.message,
    });
  }
};
