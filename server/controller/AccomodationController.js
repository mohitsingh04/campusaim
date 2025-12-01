import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import { AccomodationImageMover } from "../helper/folder-cleaners/PropertyImageMover.js";
import path from "path";
import Accomodation from "../models/Accomodation.js";
import { downloadImageAndReplaceSrc } from "../helper/folder-cleaners/EditorImagesController.js";

export const AddAccomodation = async (req, res) => {
  try {
    const {
      userId,
      property_id,
      accomodation_name,
      accomodation_price,
      accomodation_description,
    } = req.body;

    if (!userId && !property_id) {
      return res.status(400).json({ error: "All Field Required" });
    }

    let updatedDescription = accomodation_description;
    if (accomodation_description) {
      updatedDescription = await downloadImageAndReplaceSrc(
        accomodation_description,
        property_id
      );
    }

    const lastAccomodation = await Accomodation.findOne().sort({
      uniqueId: -1,
    });
    let newUniqueId = lastAccomodation ? lastAccomodation.uniqueId + 1 : 1;

    const newAccomodation = new Accomodation({
      uniqueId: newUniqueId,
      accomodation_name,
      accomodation_price,
      accomodation_description: updatedDescription,
      userId,
      property_id,
      accomodation_images: [],
    });

    await newAccomodation.save();

    const accomodationCount = await Accomodation.find({
      property_id: property_id,
    });
    if (accomodationCount.length === 1) {
      await addPropertyScore({
        property_id,
        property_score: 10,
      });
    }

    return res
      .status(201)
      .json({ message: "Accomodation created successfully" });
  } catch (error) {
    console.error("AddAccomodation Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAccomodationByPropertyId = async (req, res) => {
  try {
    const { property_id } = req.params;
    const accomodation = await Accomodation.find({ property_id: property_id });
    if (!accomodation) {
      return res.status(404).json({ error: "Accomodation Not Found" });
    }

    return res.status(200).json(accomodation);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getAllAccomodation = async (req, res) => {
  try {
    const accomodation = await Accomodation.find();
    if (!accomodation) {
      return res.status(404).json({ error: "Accomodation Not Found" });
    }

    return res.status(200).json(accomodation);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const EditAccomodation = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const {
      property_id,
      accomodation_name,
      accomodation_price,
      accomodation_description,
    } = req.body;

    const existingAccomodation = await Accomodation.findOne({ uniqueId });
    if (!existingAccomodation) {
      return res.status(404).json({ error: "Accomodation not found." });
    }

    const duplicateAccomodation = await Accomodation.findOne({
      uniqueId: { $ne: uniqueId },
      property_id,
      accomodation_name: accomodation_name,
    });

    if (duplicateAccomodation) {
      return res.status(400).json({
        error:
          "Another accomodation with the same name already exists for this property.",
      });
    }

    let updatedDescription = accomodation_description;
    if (accomodation_description) {
      updatedDescription = await downloadImageAndReplaceSrc(
        accomodation_description,
        property_id
      );
    }

    await Accomodation.findOneAndUpdate(
      { uniqueId },
      {
        $set: {
          accomodation_name,
          accomodation_price,
          accomodation_description: updatedDescription,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Accomodation updated successfully" });
  } catch (error) {
    console.error("EditAccomodation Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const AddAccomodationImages = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    let newImages = [];

    if (req?.files?.images && req.files.images.length > 0) {
      for (const file of req.files.images) {
        if (file?.originalFilename && file?.webpFilename) {
          newImages.push(file.originalFilename);
          newImages.push(file.webpFilename);
        } else {
          console.warn("Skipping incomplete image pair:", file);
        }
      }

      if (newImages.length % 2 !== 0) {
        return res.status(400).json({
          message: "Uneven number of original and webp images detected.",
        });
      }
    }

    if (newImages.length === 0) {
      return res.status(400).json({
        message: "No valid accomodation images provided.",
      });
    }

    const existingAccomodation = await Accomodation.findOne({ uniqueId });
    if (!existingAccomodation) {
      return res.status(404).json({
        message: "Accomodation not found with the given uniqueId.",
      });
    }

    const currentCount = existingAccomodation.accomodation_images.length;
    const total = currentCount + newImages.length;

    if (total > 16) {
      return res.status(400).json({
        error: `Cannot add more than 8 image. Currently have ${
          currentCount / 2
        } images.`,
      });
    }

    const updatedAccomodation = await Accomodation.findOneAndUpdate(
      { uniqueId },
      { $push: { accomodation_images: { $each: newImages } } },
      { new: true }
    );

    await AccomodationImageMover(req, res, updatedAccomodation?.property_id);

    return res
      .status(200)
      .json({ message: "Accomodation images added successfully." });
  } catch (error) {
    console.error("Error adding accomodation images:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const removeAccomodationImages = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const { webpPaths } = req.body;

    if (!Array.isArray(webpPaths) || webpPaths.length === 0) {
      return res.status(400).json({
        message: "Invalid or empty image path array.",
      });
    }

    const accomodation = await Accomodation.findOne({ uniqueId });
    if (!accomodation) {
      return res.status(404).json({
        message: "No accomodation found for this uniqueId.",
      });
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

      const originalPath = accomodation.accomodation_images.find((p) => {
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

    const updatedImages = accomodation.accomodation_images.filter(
      (img) => !pathsToRemove.has(img)
    );

    accomodation.accomodation_images = updatedImages;
    await accomodation.save();

    return res.status(200).json({
      message: "Selected accomodation images removed from database.",
      accomodation: accomodation,
    });
  } catch (error) {
    console.error("Error removing accomodation images:", error);
    return res.status(500).json({ message: error.message });
  }
};
