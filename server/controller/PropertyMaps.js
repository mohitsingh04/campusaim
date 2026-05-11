import PropertyMap from "../models/PropertyMaps.js";
import mongoose from "mongoose";

export const upsertPropertyMap = async (req, res) => {
    try {
        const { property_id, mapUrl } = req.body;

        if (!property_id || !mapUrl) {
            return res.status(400).json({
                message: "property_id and mapUrl are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(property_id)) {
            return res.status(400).json({
                message: "Invalid property_id"
            });
        }
        const propertyMap = await PropertyMap.findOneAndUpdate(
            { property_id: property_id },
            { mapUrl: mapUrl, property_id: property_id },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        return res.status(200).json({
            message: "Property map created/updated successfully",
            data: propertyMap
        });

    } catch (error) {
        console.error("Upsert Property Map Error:", error);
        return res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

export const getPropertyMapByPropertyId = async (req, res) => {
    try {
        const { property_id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(property_id)) {
            return res.status(400).json({ message: "Invalid property_id" });
        }

        const propertyMap = await PropertyMap.findOne({ property_id });

        if (!propertyMap) {
            return res.status(404).json({ message: "Property map not found" });
        }

        return res.status(200).json(propertyMap);
    } catch (error) {
        console.error("Get Property Map Error:", error);
        return res.status(500).json({
            message: "Server Error", error: error.message
        });
    }
};


export const getAllPropertyMaps = async (req, res) => {
    try {
        const propertyMaps = await PropertyMap.find()
            .sort({ createdAt: -1 });

        if (!propertyMaps) {
            return res.status(404).json({ message: "No property maps found" });
        }

        return res.status(200).json({
            count: propertyMaps.length,
            data: propertyMaps
        });

    } catch (error) {
        console.error("Get All Property Maps Error:", error);
        return res.status(500).json({
            message: "Server Error", error: error.message
        });
    }
};