import Requirments from "../models/Requirements.js";

export const CreateRequirmentController = async (req, res) => {
  try {
    const { requirment } = req.body;

    const existingOutCome = await Requirments.findOne({ requirment });

    if (existingOutCome) {
      return res.status(400).json({ error: "Requirments already exists." });
    }

    const lastDoc = await Requirments.findOne().sort({ uniqueId: -1 });
    const uniqueId = lastDoc ? lastDoc?.uniqueId + 1 : 1;

    const newRequirment = new Requirments({
      uniqueId,
      requirment,
    });

    await newRequirment.save();

    return res
      .status(201)
      .json({ message: "Requirments created successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllRequirments = async (req, res) => {
  try {
    const requirmentsOutcomes = await Requirments.find();

    if (!requirmentsOutcomes) {
      return res.status(404).json({ error: "Requirments Not Found" });
    }

    return res.status(200).json(requirmentsOutcomes);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getRequirmentById = async (req, res) => {
  try {
    const { objectId } = req.params;
    const requirmentsOutcomes = await Requirments.findById(objectId);

    if (!requirmentsOutcomes) {
      return res.status(404).json({ error: "Requirments Not Found" });
    }

    return res.status(200).json(requirmentsOutcomes);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Update Requirement
export const updateRequirment = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { requirment } = req.body; // field coming from frontend

    const requirmentsOutcomes = await Requirments.findById(objectId);

    if (!requirmentsOutcomes) {
      return res.status(404).json({ error: "Requirment Not Found" });
    }

    requirmentsOutcomes.requirment =
      requirment || requirmentsOutcomes.requirment;

    await requirmentsOutcomes.save();

    return res.status(200).json({
      message: "Requirment Updated Successfully",
      data: requirmentsOutcomes,
    });
  } catch (error) {
    console.error("Update Requirement Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
