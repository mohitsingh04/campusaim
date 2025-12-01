import Hiring from "../models/Hiring.js";

export const addHiring = async (req, res) => {
  try {
    const {
      property_id,
      title,
      job_description,
      experience,
      job_type,
      start_date,
      end_date,
      salary,
      skills,
      qualification,
    } = req.body;

    if (
      !property_id ||
      !title ||
      !job_description ||
      !experience ||
      !job_type ||
      !salary ||
      !skills ||
      !qualification
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existingHiring = await Hiring.findOne({ title, isExpired: false });
    if (existingHiring) {
      return res.status(409).json({
        error: "A job with the same title already exists and is not expired.",
      });
    }

    const lastDoc = await Hiring.findOne().sort({ uniqueId: -1 });
    const uniqueId = lastDoc ? lastDoc?.uniqueId + 1 : 1;

    const newHiring = new Hiring({
      uniqueId,
      property_id,
      title,
      job_description,
      experience,
      job_type,
      start_date,
      end_date,
      salary,
      skills,
      qualification,
    });

    await newHiring.save();

    return res.status(201).json({
      message: "Hiring post created successfully",
      data: newHiring,
    });
  } catch (error) {
    console.error("Error creating hiring post:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getHiringByPropertyId = async (req, res) => {
  try {
    const { property_id } = req.params;

    const hirings = await Hiring.find({ property_id: property_id });
    if (!hirings) {
      return res.status(404).json({ error: "Hirings Not Found" });
    }

    return res.status(200).json(hirings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getHiringByObjectId = async (req, res) => {
  try {
    const { objectId } = req.params;

    const hirings = await Hiring.findOne({ _id: objectId });
    if (!hirings) {
      return res.status(404).json({ error: "Hirings Not Found" });
    }

    return res.status(200).json(hirings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getHiring = async (req, res) => {
  try {
    const hirings = await Hiring.find();
    if (!hirings) {
      return res.status(404).json({ error: "Hirings Not Found" });
    }

    return res.status(200).json(hirings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteHiring = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    if (!uniqueId) {
      return res.status(400).json({ error: "UniqueId is Required" });
    }

    const isDeleted = await Hiring.findOneAndDelete({ uniqueId: uniqueId });

    if (!isDeleted) {
      return res.status(404).json({ error: "Hiring Not Found" });
    }

    return res.status(200).json({ message: "Hiring is Deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateHiring = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    const {
      title,
      job_description,
      experience,
      job_type,
      start_date,
      end_date,
      salary,
      skills,
      qualification,
      status,
      isExpired,
    } = req.body;

    if (
      !title ||
      !job_description ||
      !experience ||
      !job_type ||
      !salary ||
      !skills ||
      !qualification
    ) {
      return res.status(400).json({ error: "Required fields are missing." });
    }

    const existingHiring = await Hiring.findOne({
      title,
      isExpired: false,
      uniqueId: { $ne: uniqueId },
    });
    if (existingHiring) {
      return res.status(409).json({
        error: "A job with the same title already exists and is not expired.",
      });
    }

    const updatedHiring = await Hiring.findOneAndUpdate(
      { uniqueId: Number(uniqueId) },
      {
        title,
        job_description,
        experience,
        job_type,
        start_date,
        end_date,
        salary,
        skills,
        qualification,
        ...(status !== undefined && { status }),
        ...(isExpired !== undefined && { isExpired }),
      },
      { new: true }
    );

    if (!updatedHiring) {
      return res.status(404).json({ error: "Hiring post not found." });
    }

    return res.status(200).json({
      message: "Hiring post updated successfully",
      data: updatedHiring,
    });
  } catch (error) {
    console.error("Error updating hiring post:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
