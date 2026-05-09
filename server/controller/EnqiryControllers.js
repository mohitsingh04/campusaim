import { addEnquiryCount } from "../analytic-controller/EnquiryCountController.js";
import ArchiveEnquiry from "../models/ArchiveEnquiry.js";
import Enquiry from "../models/Enquiry.js";
import Property from "../models/Property.js";

export const getAllEnquiry = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });

    if (!enquiries.length) {
      return res.status(404).json({ error: "No enquiries found" });
    }

    return res.status(200).json(enquiries);
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const softDeleteEnquiry = async (req, res) => {
  try {
    const { objectId } = req.params;
    const enquiry = await Enquiry.findById(objectId);

    if (!enquiry) {
      return res.status(404).json({ error: "Enquiry not found" });
    }

    const archivedEnquiry = new ArchiveEnquiry(enquiry.toObject());
    await archivedEnquiry.save();
    await Enquiry.findByIdAndDelete(objectId);

    return res.status(200).json({ message: "Enquiry Deleted successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getEnquiryByPropertyId = async (req, res) => {
  try {
    const { property_id } = req.params;
    const enquiries = await Enquiry.find({ property_id });

    if (!enquiries.length) {
      return res
        .status(404)
        .json({ message: "No enquiries found for this property" });
    }

    return res.status(200).json(enquiries);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const enquiryStatus = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { status } = req.body;

    if (!objectId || !status) {
      return res
        .status(400)
        .json({ error: "Object ID and status are required." });
    }

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      objectId,
      { $set: { status } },
      { new: true },
    );

    if (!updatedEnquiry) {
      return res.status(404).json({ error: "Enquiry not found." });
    }

    return res.status(200).json({
      message: "Enquiry status updated successfully.",
      enquiry: updatedEnquiry,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getEnquiryByObjectId = async (req, res) => {
  try {
    const { objectId } = req.params;

    if (!objectId) {
      return res.status(400).json({ error: "Object ID is required" });
    }

    const enquiry = await Enquiry.findById(objectId);

    if (!enquiry) {
      return res.status(404).json({ error: "Enquiry not found" });
    }

    return res.status(200).json(enquiry);
  } catch (error) {
    console.error("Error fetching enquiry:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addEnquiry = async (req, res) => {
  try {
    const {
      userId,
      property_id,
      property_name,
      name,
      email,
      contact,
      city,
      message,
      preferred_course,
    } = req.body;

    if (!property_id) {
      return res.status(400).json({ error: "Required field is Missing" });
    }

    const property = await Property.findOne({ _id: property_id });
    const payload = {
      property_id: property?._id,
      property_name,
      name,
      email,
      contact,
      city,
      message,
      preferred_course,
    };

    if (userId) {
      payload.userId = userId;
    }

    const newEnquiry = new Enquiry(payload);

    const savedEnquiry = await newEnquiry.save();

    await addEnquiryCount(property?._id);

    if (savedEnquiry) {
      return res
        .status(200)
        .json({ message: "You are enrolled successfully!" });
    }
  } catch (error) {
    console.error("Error while adding enquiry:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getArchiveEnquiryByObjectId = async (req, res) => {
  try {
    const { objectId } = req.params;

    if (!objectId) {
      return res.status(400).json({ error: "Object ID is required" });
    }

    const enquiry = await ArchiveEnquiry.findById(objectId);

    if (!enquiry) {
      return res.status(404).json({ error: "Archived enquiry not found" });
    }

    return res.status(200).json(enquiry);
  } catch (error) {
    console.error("Error fetching archived enquiry:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllArchiveEnquiry = async (req, res) => {
  try {
    const enquiries = await ArchiveEnquiry.find();

    if (!enquiries.length) {
      return res.status(404).json({ error: "No archived enquiries found" });
    }

    return res.status(200).json(enquiries);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteArchiveEnquiry = async (req, res) => {
  try {
    const { objectId } = req.params;

    const deletedEnquiry = await ArchiveEnquiry.findByIdAndDelete(objectId);

    if (!deletedEnquiry) {
      return res.status(404).json({ error: "Enquiry Not Found" });
    }

    return res.status(200).json({ message: "Enquiry Deleted Permanently" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
};
export const archiveStatus = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { status } = req.body;

    if (!objectId || !status) {
      return res
        .status(400)
        .json({ error: "Object ID and status are required." });
    }

    const updatedEnquiry = await ArchiveEnquiry.findByIdAndUpdate(
      objectId,
      { $set: { status } },
      { new: true },
    );

    if (!updatedEnquiry) {
      return res.status(404).json({ error: "Archive not found." });
    }

    return res
      .status(200)
      .json({ message: "Archive status updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getArchiveEnquiryByPropertyId = async (req, res) => {
  try {
    const { property_id } = req.params;
    const enquiry = await ArchiveEnquiry.find({ property_id: property_id });

    return res.status(200).json(enquiry);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
