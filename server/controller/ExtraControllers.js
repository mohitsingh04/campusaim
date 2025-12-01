import City from "../models/City.js";
import State from "../models/States.js";
import Country from "../models/Country.js";

export const getCountry = async (req, res) => {
  try {
    const countries = await Country.find().sort({ country_name: 1 });

    if (!countries || countries.length === 0) {
      return res.status(404).json({ message: "No countries found." });
    }

    return res.status(200).json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getState = async (req, res) => {
  try {
    const states = await State.find().sort({ name: 1 });

    if (!states || states.length === 0) {
      return res.status(404).json({ message: "No states found." });
    }

    return res.status(200).json(states);
  } catch (error) {
    console.error("Error fetching states:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getCity = async (req, res) => {
  try {
    const cities = await City.find().sort({ name: 1 });

    if (!cities || cities.length === 0) {
      return res.status(404).json({ message: "No cities found." });
    }

    return res.status(200).json(cities);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};
