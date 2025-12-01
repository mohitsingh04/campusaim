import path from "path";
import Certifications from "../models/Certifications.js";
import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import { certificationsImageMover } from "../helper/folder-cleaners/PropertyImageMover.js";

export const addCertifications = async (req, res) => {
  try {
    const { property_id } = req.body;
    let certifications = [];

    const PropertyScore = 10;

    if (req?.files?.certifications && req.files.certifications.length > 0) {
      const files = req.files.certifications;

      if (files.length > 8) {
        return res
          .status(400)
          .json({ message: "Only 8 certifications image pairs are allowed." });
      }

      for (const file of files) {
        if (file?.filename && file?.webpFilename) {
          certifications.push(file.filename);
          certifications.push(file.webpFilename);
        } else {
          console.warn("Skipping incomplete file pair:", file);
        }
      }

      if (certifications.length % 2 !== 0) {
        return res.status(400).json({
          message: "Uneven number of original and webp images detected.",
        });
      }
    }

    const existing = await Certifications.findOne({ property_id });
    if (existing) {
      return res.status(400).json({
        message: "Certifications already exist for this property.",
      });
    }

    const lastCertifications = await Certifications.findOne().sort({ _id: -1 });
    const uniqueId = lastCertifications ? lastCertifications.uniqueId + 1 : 1;

    const newCertifications = new Certifications({
      uniqueId,
      property_id,
      certifications,
    });

    const saved = await newCertifications.save();

    await certificationsImageMover(req, res, property_id);

    await addPropertyScore({
      property_score: PropertyScore,
      property_id,
    });

    return res.status(200).json({
      message: "Certifications added successfully",
      data: saved,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const addNewcertifications = async (req, res) => {
  try {
    const { property_id } = req.params;

    let newCertifications = [];

    if (req?.files?.certifications && req.files.certifications.length > 0) {
      for (const file of req.files.certifications) {
        if (file?.filename && file?.webpFilename) {
          newCertifications.push(file.filename);
          newCertifications.push(file.webpFilename);
        } else {
          console.warn("Skipping incomplete file pair:", file);
        }
      }

      if (newCertifications.length % 2 !== 0) {
        return res.status(400).json({
          message: "Uneven number of original and webp images detected.",
        });
      }
    }

    if (newCertifications.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid Certifications provided." });
    }

    const existing = await Certifications.findOne({ property_id });
    if (!existing) {
      return res.status(404).json({
        message:
          "No Certifications found for this property. Use the 'addCertifications' controller to create the initial record.",
      });
    }

    const currentCount = existing.certifications.length;
    const total = currentCount + newCertifications.length;

    if (total > 16) {
      return res.status(400).json({
        message: `Cannot add more than 8 certifications image pairs. You already have ${
          currentCount / 2
        }.`,
      });
    }

    const isFirstTimeAdding = currentCount === 0;

    existing.certifications.push(...newCertifications);
    const updated = await existing.save();

    if (isFirstTimeAdding) {
      await addPropertyScore({
        property_score: 10,
        property_id,
      });
    }

    await certificationsImageMover(req, res, property_id);

    return res.status(200).json({
      message: "New Certifications added successfully",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const getCertificationsByPropertyId = async (req, res) => {
  try {
    const { property_id } = req.params;

    const id = Number(property_id);

    const certifications = await Certifications.findOne({
      property_id: id,
    });
    if (!certifications) {
      return res.status(404).json({ error: "Certifications Not found" });
    }

    return res.status(200).json(certifications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
export const getAllCertifications = async (req, res) => {
  try {
    const certifications = await Certifications.findOne();
    if (!certifications) {
      return res.status(404).json({ error: "Certifications Not found" });
    }

    return res.status(200).json(certifications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const removecertifications = async (req, res) => {
  try {
    const { property_id } = req.params;
    const { webpPaths } = req.body;

    if (!Array.isArray(webpPaths) || webpPaths.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or empty image path array." });
    }

    const certification = await Certifications.findOne({ property_id });
    if (!certification) {
      return res
        .status(404)
        .json({ message: "No Certifications found for this property." });
    }

    const pathsToRemove = new Set();

    for (const webpPath of webpPaths) {
      pathsToRemove.add(webpPath);

      const webpFileName = path.basename(webpPath);
      const folderPath = path.dirname(webpPath);

      const match = webpFileName.match(/^img-\d+-(.+)-compressed\.webp$/);
      if (!match) {
        console.warn(`Filename pattern not matched for: ${webpFileName}`);
        continue;
      }

      const fileKey = match[1];

      const originalPath = certification.certifications.find((p) => {
        const filename = path.basename(p);
        const dir = path.dirname(p);
        const origMatch = filename.match(/^img-\d+-(.+)\.[a-zA-Z0-9]+$/);

        return (
          dir === folderPath &&
          origMatch &&
          origMatch[1] === fileKey &&
          !filename.endsWith(".webp")
        );
      });

      if (originalPath) {
        pathsToRemove.add(originalPath);
        console.log(`Found original for ${webpFileName}: ${originalPath}`);
      } else {
        console.warn(`Original file not found for key: ${fileKey}`);
      }
    }

    const updatedCertifications = certification.certifications.filter(
      (img) => !pathsToRemove.has(img)
    );

    const isLastImageRemoved = updatedCertifications.length === 0;

    certification.certifications = updatedCertifications;
    await certification.save();

    if (isLastImageRemoved) {
      await addPropertyScore({
        property_score: -10,
        property_id,
      });
    }

    return res.status(200).json({
      message:
        "Selected certifications image references removed from database.",
      data: certification,
    });
  } catch (error) {
    console.error("Error removing Certifications:", error);
    return res.status(500).json({ message: error.message });
  }
};
