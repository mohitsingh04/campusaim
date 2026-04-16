import mongoose from "mongoose";
import City from "../models/city.js";
import Location from "../models/locationModel.js";
import States from "../models/statesModel.js";
import Countries from "../models/countryModel.js";

export const getCountries = async (req, res) => {
    try {
        const countries = await Countries.find({})
            .select("country_name id") // only required fields
            .sort({ country_name: 1 })
            .lean();

        return res.status(200).json(countries);
    } catch (error) {
        console.error("getCountries error:", error);
        return res.status(500).json({ error: "Failed to fetch countries" });
    }
};

export const getCity = async (req, res) => {
    try {
        const { state } = req.query;

        if (!state || typeof state !== "string") {
            return res.status(400).json({ error: "Valid state is required" });
        }

        const cities = await City.find({ state_name: state })
            .select("name id state_name")
            .sort({ name: 1 })
            .lean();

        return res.status(200).json(cities);
    } catch (error) {
        console.error("getCity error:", error);
        return res.status(500).json({ error: "Failed to fetch cities" });
    }
};

export const getStates = async (req, res) => {
    try {
        const { country } = req.query;

        if (!country || typeof country !== "string") {
            return res.status(400).json({ error: "Valid country is required" });
        }

        const states = await States.find({ country_name: country })
            .select("name id country_name")
            .sort({ name: 1 })
            .lean();

        return res.status(200).json(states);
    } catch (error) {
        console.error("getStates error:", error);
        return res.status(500).json({ error: "Failed to fetch states" });
    }
};

export const getLocationById = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const location = await Location.findOne({ userId });

        if (!location) {
            return res.status(404).json({ error: "Location not found" });
        }

        return res.status(200).json({ success: true, data: location });

    } catch (error) {
        console.error("Error in getLocationById:", error);
        return res.status(500).json({ error: "Server Error" });
    }
};

export const updateLocation = async (req, res) => {
    try {
        const { userId } = req.params;

        // ✅ STRONG ObjectId validation
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const {
            address = "",
            pincode = "",
            city = "",
            state = "",
            country = ""
        } = req.body;

        const updated = await Location.findOneAndUpdate(
            { userId }, // reference match
            {
                $set: {
                    address: address.trim(),
                    pincode: String(pincode).trim(),
                    city: city.trim(),
                    state: state.trim(),
                    country: country.trim()
                },
                $setOnInsert: {
                    userId // set ONLY on create
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Location saved successfully.",
            data: updated
        });

    } catch (error) {
        console.error("Error in updateLocation:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};