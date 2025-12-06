import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import Location from "../models/Location.js";
import State from "../models/States.js";
import City from "../models/City.js";
import Country from "../models/Country.js";
import Property from "../models/Property.js";
import PropertySeo from "../models/PropertySeo.js";
import { generateSlug } from "../utils/Callback.js";
import mongoose from "mongoose";

export const getLocation = async (req, res) => {
  try {
    const { property_id } = req.params;

    if (!property_id) {
      return res.status(400).json({ error: "Property ID is required" });
    }

    const location = await Location.findOne({ property_id });

    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    return res.status(200).json(location);
  } catch (error) {
    console.error("getLocation Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllLocations = async (req, res) => {
  try {
    const location = await Location.find();
    if (!location) {
      return res.status(404).json({ error: "Locations not Found" });
    }

    return res.status(200).json(location);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addLocation = async (req, res) => {
  try {
    const {
      property_id,
      property_address,
      property_pincode,
      property_country,
      property_state,
      property_city,
      country_name,
      state_name,
      city_name,
    } = req.body;

    // Validate ObjectId
    if (!property_id || !mongoose.Types.ObjectId.isValid(property_id)) {
      return res.status(400).json({ error: "Invalid or missing property_id." });
    }

    // Determine final used values
    const finalCountry =
      country_name?.trim() !== "" ? country_name.trim() : property_country?.trim();

    const finalState =
      state_name?.trim() !== "" ? state_name.trim() : property_state?.trim();

    const finalCity =
      city_name?.trim() !== "" ? city_name.trim() : property_city?.trim();

    if (
      !property_address ||
      !property_pincode ||
      !finalCountry ||
      !finalState ||
      !finalCity
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Add Country if not exists
    if (country_name?.trim()) {
      const existingCountry = await Country.findOne({ country_name: finalCountry });
      if (!existingCountry) await Country.create({ country_name: finalCountry });
    }

    // Add State if not exists
    if (state_name?.trim()) {
      const existingState = await State.findOne({
        name: finalState,
        country_name: finalCountry,
      });
      if (!existingState) {
        await State.create({ name: finalState, country_name: finalCountry });
      }
    }

    // Add City if not exists
    if (city_name?.trim()) {
      const existingCity = await City.findOne({
        name: finalCity,
        state_name: finalState,
        country_name: finalCountry,
      });
      if (!existingCity) {
        await City.create({
          name: finalCity,
          state_name: finalState,
          country_name: finalCountry,
        });
      }
    }

    // Check duplicate location
    const existingLocation = await Location.findOne({
      property_id,
      property_address,
      property_pincode,
      property_country: finalCountry,
      property_state: finalState,
      property_city: finalCity,
    });

    if (existingLocation) {
      return res
        .status(400)
        .json({ error: "Location already exists for this property." });
    }

    // Create Location
    const newLocation = new Location({
      property_id,
      property_address,
      property_pincode,
      property_country: finalCountry,
      property_state: finalState,
      property_city: finalCity,
    });

    await newLocation.save();

    // Add Property Score
    await addPropertyScore({
      property_id: String(property_id),
      property_score: 10,
    });

    // Fetch Property using ObjectId
    const property = await Property.findById(property_id);
    if (property) {
      const baseSlug = generateSlug(`${property.property_name}-${finalCity}`);
      let slug = baseSlug;
      let counter = 2;

      // Ensure unique slug
      while (
        await Property.findOne({
          property_slug: slug,
          _id: { $ne: property._id },
        })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Update property slug
      await Property.findByIdAndUpdate(property_id, {
        $set: { property_slug: slug },
      });

      // Update Property SEO
      await PropertySeo.findOneAndUpdate(
        { property_id },
        { $set: { seo_slug: slug } }
      );

      console.log("Slug set for property:", property_id, slug);
    }

    return res.status(201).json({ message: "Location added successfully." });
  } catch (err) {
    console.error("Add location error:", err);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const UpdateLocation = async (req, res) => {
  try {
    const { property_id } = req.params;

    if (!property_id) {
      return res.status(400).json({ error: "Property ID is required" });
    }

    let PropertyScore = 0;

    const existingLocation = await Location.findOne({ property_id });
    if (!existingLocation) {
      return res.status(404).json({ error: "Property not found." });
    }

    let {
      property_address,
      property_pincode,
      property_country,
      property_state,
      property_city,
      country_name,
      state_name,
      city_name,
    } = req.body;

    if (
      !property_address &&
      !property_pincode &&
      !property_country &&
      !property_state &&
      !property_city &&
      !country_name &&
      !state_name &&
      !city_name
    ) {
      return res.status(400).json({ error: "No data provided to update" });
    }

    const updateData = {};
    const unsetData = {};

    // 🟩 Insert into Country if needed
    if (country_name) {
      let existingCountry = await Country.findOne({
        country_name: country_name.trim(),
      });
      if (!existingCountry) {
        existingCountry = new Country({ country_name: country_name.trim() });
        await existingCountry.save();
      }
      updateData.property_country = country_name.trim();
      unsetData.property_state = "";
      unsetData.property_city = "";
      PropertyScore += 2;
    } else if (property_country) {
      updateData.property_country = property_country.trim();
      unsetData.property_state = "";
      unsetData.property_city = "";
      if (!existingLocation?.property_country) PropertyScore += 2;
    }

    // 🟩 Insert into State if needed
    if (state_name) {
      if (!updateData.property_country && !existingLocation?.property_country) {
        return res.status(400).json({
          error:
            "Country is required before adding a state. Please provide property_country or country_name.",
        });
      }
      const parentCountry =
        updateData.property_country || existingLocation?.property_country;
      let existingState = await State.findOne({
        name: state_name.trim(),
        country_name: parentCountry,
      });
      if (!existingState) {
        existingState = new State({
          name: state_name.trim(),
          country_name: parentCountry,
        });
        await existingState.save();
      }
      updateData.property_state = state_name.trim();
      unsetData.property_city = "";
      PropertyScore += 2;
    } else if (property_state) {
      updateData.property_state = property_state.trim();
      unsetData.property_city = "";
      if (!existingLocation?.property_state) PropertyScore += 2;
    }

    // 🟩 Insert into City if needed
    if (city_name) {
      if (!updateData.property_state && !existingLocation?.property_state) {
        return res.status(400).json({
          error:
            "State is required before adding a city. Please provide property_state or state_name.",
        });
      }
      const parentState =
        updateData.property_state || existingLocation?.property_state;
      const parentCountry =
        updateData.property_country || existingLocation?.property_country;
      let existingCity = await City.findOne({
        name: city_name.trim(),
        state_name: parentState,
        country_name: parentCountry,
      });
      if (!existingCity) {
        existingCity = new City({
          name: city_name.trim(),
          state_name: parentState,
          country_name: parentCountry,
        });
        await existingCity.save();
      }
      updateData.property_city = city_name.trim();
      PropertyScore += 2;
    } else if (property_city) {
      updateData.property_city = property_city.trim();
      if (!existingLocation?.property_city) PropertyScore += 2;
    }

    // 🟩 Handle address and pincode updates
    if (property_address) {
      updateData.property_address = property_address.trim();
      if (!existingLocation?.property_address) PropertyScore += 2;
    }
    if (property_pincode) {
      updateData.property_pincode = property_pincode.trim();
      if (!existingLocation?.property_pincode) PropertyScore += 2;
    }

    const updatedLocation = await Location.findOneAndUpdate(
      { property_id },
      { $set: updateData, $unset: unsetData },
      { new: true }
    );

    // 🟩 Update property score
    await addPropertyScore({
      property_id,
      property_score: PropertyScore,
    });

    // 🟩 Regenerate slug for property and seo
    const property = await Property.findOne({ property_id });
    if (property) {
      const finalCity =
        updateData.property_city || existingLocation?.property_city;
      const baseSlug = generateSlug(`${property?.property_name}-${finalCity}`);
      let slug = baseSlug;
      let counter = 2;

      // Ensure uniqueness across properties
      while (
        await Property.findOne({
          property_slug: slug,
        })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Update property slug
      await Property.findOneAndUpdate(
        { $set: { property_slug: slug } }
      );

      const seoDoc = await PropertySeo.findOne({
        property_id: property?._id,
      });
      if (seoDoc && seoDoc.seo_slug !== slug) {
        await PropertySeo.findOneAndUpdate(
          { property_id: property?._id },
          { $set: { seo_slug: slug } }
        );
      }

      console.log("Slug updated for property:", slug);
    }

    return res.status(200).json({
      message: "Location updated successfully.",
      data: updatedLocation,
    });
  } catch (error) {
    console.error("UpdateLocation Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
