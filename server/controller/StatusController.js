import Status from "../models/Status.js";

export const getStatus = async (req, res) => {
  try {
    const status = await Status.find().sort({ name: 1 });
    return res.status(200).json(status);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addStatus = async (req, res) => {
  try {
    const { status_name, parent_status, description } = req.body;

    const existStatus = await Status.findOne({
      name: status_name,
      parent_status,
    });
    if (existStatus) {
      return res.status(400).json({ error: "This status already exists." });
    }

    const lastStatus = await Status.findOne().sort({ _id: -1 }).exec();
    const uniqueId = lastStatus ? lastStatus.uniqueId + 1 : 1;

    const newStatus = new Status({
      uniqueId,
      name: status_name,
      parent_status,
      description,
    });

    await newStatus.save();
    return res.status(201).json({ message: "Status added successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { status_name, parent_status, description } = req.body;

    const existStatus = await Status.findOne({
      name: status_name,
      parent_status: parent_status,
      _id: { $ne: objectId },
    });

    if (existStatus) {
      return res.status(400).json({ error: "This status already exists." });
    }

    const updatedStatus = await Status.findByIdAndUpdate(
      objectId,
      { name: status_name, parent_status, description },
      { new: true, runValidators: true }
    );

    if (!updatedStatus) {
      return res.status(404).json({ error: "Status not found." });
    }

    return res.status(200).json({ message: "Status updated successfully." });
  } catch (err) {
    console.error("Error updating status:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteStatus = async (req, res) => {
  try {
    const { objectId } = req.params;

    const deletedStatus = await Status.findByIdAndDelete(objectId);

    if (!deletedStatus) {
      return res.status(404).json({ error: "Status not found." });
    }

    return res.status(200).json({ message: "Status deleted successfully." });
  } catch (err) {
    console.error("Error deleting status:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getStatusById = async (req, res) => {
  try {
    const { objectId } = req.params;

    const status = await Status.findById(objectId);

    if (!status) {
      return res.status(404).json({ error: "Status not found." });
    }

    return res.status(200).json(status);
  } catch (err) {
    console.error("Error fetching status:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
