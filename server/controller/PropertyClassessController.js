import mongoose from "mongoose";
import PropertyClassess from "../models/PropertyClassess.js";

export const createOrUpdatePropertyClassess = async (req, res) => {
  try {
    const { property_id, classess } = req.body;

    if (!property_id) {
      return res.status(400).json({ message: "property_id is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(property_id)) {
      return res.status(400).json({ message: "Invalid property_id" });
    }

    if (!Array.isArray(classess)) {
      return res.status(400).json({ message: "classess must be an array" });
    }

    const formattedClassess = classess.map((item) => ({
      class_name: item.class_name,
      is_available: item.is_available || false,
      admission_open: item.admission_open || false,
    }));

    const propertyClassess = await PropertyClassess.findOneAndUpdate(
      { property_id },
      { property_id, classess: formattedClassess },
      { new: true, upsert: true, runValidators: true },
    );

    return res.status(200).json({
      message: "Property classes saved successfully",
      data: propertyClassess,
    });
  } catch (error) {
    console.error("CREATE/UPDATE PROPERTY CLASSESS ERROR :", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getPropertyClassess = async (req, res) => {
  try {
    const { property_id } = req.params;
    const cla = await PropertyClassess.findOne({ property_id });
    if (!cla) {
      return res.status(404).json({ error: "Classess Not Found" });
    }
    return res.status(200).json(cla);
  } catch (error) {
    console.error("error :", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
