import { verificationDocsImageMover } from "../helper/folder-cleaners/PropertyImageMover.js";
import PropertyVerificationDocs from "../models/PropertyVerificationDocs.js";

export const uploadPropertyVerificationDocs = async (req, res) => {
  try {
    const { property_id } = req.body;

    if (!property_id) {
      return res.status(400).json({ message: "Property ID is required." });
    }

    const businessFiles = req.files?.["business_identity_proof"] || [];
    const locationFiles = req.files?.["location_proof"] || [];

    const businessFilePaths = businessFiles.map(
      (file) => file.filename || file.path
    );
    const locationFilePaths = locationFiles.map(
      (file) => file.filename || file.path
    );

    let existingDoc = await PropertyVerificationDocs.findOne({ property_id });

    if (existingDoc) {
      if (businessFilePaths.length > 0) {
        existingDoc.business_identity_proof = [
          ...(existingDoc.business_identity_proof || []),
          ...businessFilePaths,
        ];
      }

      if (locationFilePaths.length > 0) {
        existingDoc.location_proof = [
          ...(existingDoc.location_proof || []),
          ...locationFilePaths,
        ];
      }

      await existingDoc.save();

      verificationDocsImageMover(req, res, property_id);

      return res.status(200).json({
        message: "Property verification documents updated successfully.",
        data: existingDoc,
      });
    } else {
      const newDoc = await PropertyVerificationDocs.create({
        property_id,
        business_identity_proof: businessFilePaths,
        location_proof: locationFilePaths,
      });

      verificationDocsImageMover(req, res, property_id);

      return res.status(201).json({
        message: "Property verification documents uploaded successfully.",
        data: newDoc,
      });
    }
  } catch (error) {
    console.error("Error uploading property verification docs:", error);
    res.status(500).json({
      error: "Internal Server Error.",
    });
  }
};

export const getPropertyVerifcationDoc = async (req, res) => {
  try {
    const { property_id } = req.params;
    const docs = await PropertyVerificationDocs.findOne({ property_id });
    if (!docs) {
      return res.status(404).json({ error: "Documents Not Found" });
    }

    return res.status(200).json(docs);
  } catch (error) {
    console.error("Error uploading property verification docs:", error);
    res.status(500).json({
      message: "Internal Server Error.",
    });
  }
};
