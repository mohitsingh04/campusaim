import mongoose from "mongoose";
import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import { GalleryImageMover } from "../helper/folder-cleaners/PropertyImageMover.js";
import Gallery from "../models/Gallery.js";
import path from "path";
import Property from "../models/Property.js";

export const getGallery = async (req, res) => {
  try {
    const gallery = await Gallery.find();
    return res.status(200).json(gallery);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getGalleryById = async (req, res) => {
  try {
    const { objectId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ error: "Invalid gallery ID." });
    }

    const gallery = await Gallery.findById(objectId);

    if (!gallery) {
      return res.status(404).json({ error: "Gallery not found." });
    }

    return res.status(200).json(gallery);
  } catch (error) {
    console.error("GetGalleryById Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getGalleryByPropertyId = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const gallery = await Gallery.find({ propertyId: propertyId });
    return res.status(200).json(gallery);
  } catch (error) {
    console.error(error);
    return res.send({ error: "Internal Server Error!" });
  }
};

export const addGallery = async (req, res) => {
  try {
    const { propertyId, title } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    const propertyUniqueId = property.uniqueId;

    const gallery = [];

    const maxImages = 8;

    if (!req?.files?.gallery || req.files.gallery.length === 0) {
      return res.status(400).json({ error: "No images provided." });
    }

    if (req.files.gallery.length > maxImages) {
      return res
        .status(400)
        .json({ error: `You can upload a maximum of ${maxImages} images.` });
    }

    req.files.gallery.forEach((file) => {
      if (file?.webpFilename) gallery.push(file.webpFilename);
      if (file?.originalFilename && file.originalFilename !== file.path) {
        gallery.push(file.originalFilename);
      }
    });

    const existingGalleries = await Gallery.countDocuments({ propertyId });

    const newGallery = new Gallery({
      propertyId,
      title,
      gallery,
    });

    const savedGallery = await newGallery.save();
    await GalleryImageMover(req, res, propertyUniqueId, propertyId);

    if (existingGalleries === 0) {
      await addPropertyScore({
        property_score: 10,
        property_id: propertyId,
      });
    }

    return res.status(201).json({
      message: "Gallery added successfully.",
      savedGallery,
    });
  } catch (error) {
    console.error("Error adding gallery:", error);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
};

export const addNewGalleryImages = async (req, res) => {
  try {
    const { objectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ message: "Invalid gallery ID." });
    }

    const gallery = await Gallery.findById(objectId);
    if (!gallery) {
      return res.status(404).json({ error: "Gallery not found." });
    }

    const property = await Property.findById(gallery.propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    const propertyUniqueId = property.uniqueId;

    let newGalleryImages = [];

    if (req?.files?.gallery && req.files.gallery.length > 0) {
      for (const file of req.files.gallery) {
        if (file?.filename && file?.webpFilename) {
          newGalleryImages.push(file.filename);
          newGalleryImages.push(file.webpFilename);
        } else {
          console.warn("Skipping incomplete gallery file pair:", file);
        }
      }

      if (newGalleryImages.length % 2 !== 0) {
        return res.status(400).json({
          message: "Uneven number of original and webp images detected in gallery.",
        });
      }
    }

    if (newGalleryImages.length === 0) {
      return res.status(400).json({ message: "No valid gallery images provided." });
    }

    const existingGallery = await Gallery.findById(objectId);

    if (!existingGallery) {
      return res.status(404).json({
        message:
          "Gallery not found for this ID. Use the 'createGallery' controller to initialize.",
      });
    }

    const currentCount = Array.isArray(existingGallery.gallery)
      ? existingGallery.gallery.length
      : 0;
    const totalCount = currentCount + newGalleryImages.length;

    if (totalCount > 16) {
      return res.status(400).json({
        message: `Cannot add more than 8 gallery image pairs. You already have ${currentCount / 2} pairs.`,
      });
    }

    existingGallery.gallery.push(...newGalleryImages);

    const updatedGallery = await existingGallery.save();

    await GalleryImageMover(req, res, propertyUniqueId, gallery.propertyId);

    return res.status(200).json({
      message: "New gallery images added successfully",
      data: updatedGallery,
    });
  } catch (error) {
    console.error("Gallery update error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const removeGalleryImages = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { webpPaths } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ message: "Invalid gallery ID." });
    }

    // Validate input array
    if (!Array.isArray(webpPaths) || webpPaths.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or empty image path array." });
    }

    // Fetch gallery document
    const galleryDoc = await Gallery.findById(objectId);
    if (!galleryDoc) {
      return res
        .status(404)
        .json({ message: "No gallery found for this ID." });
    }

    const pathsToRemove = new Set();

    for (const webpPath of webpPaths) {
      if (typeof webpPath !== "string") continue;

      pathsToRemove.add(webpPath);

      const webpFileName = path.basename(webpPath);
      const folderPath = path.dirname(webpPath);

      const match = webpFileName.match(/^img-\d+-(.+)-compressed\.webp$/);
      if (!match) {
        console.warn(`Filename pattern not matched for: ${webpFileName}`);
        continue;
      }

      const fileKey = match[1];

      // Find matching original image in DB
      const originalPath = galleryDoc.gallery.find((p) => {
        if (typeof p !== "string") return false;

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

    // Remove from gallery list
    const updatedGallery = galleryDoc.gallery.filter(
      (img) => !pathsToRemove.has(img)
    );

    galleryDoc.gallery = updatedGallery;
    await galleryDoc.save();

    return res.status(200).json({
      message: "Selected gallery images removed from database.",
      data: galleryDoc,
    });
  } catch (error) {
    console.error("Error removing gallery images:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateGallery = async (req, res) => {
  try {
    const { objectId } = req.params;

    if (!objectId || !mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ error: "Gallery ID is required and must be valid!" });
    }

    const existGallery = await Gallery.findById(objectId);
    if (!existGallery) {
      return res.status(404).json({ error: "Gallery not found!" });
    }

    let { title, gallery } = req.body;

    // Normalize incoming `gallery` to an array of strings
    if (!gallery) {
      gallery = [];
    } else if (typeof gallery === "string") {
      try {
        const parsed = JSON.parse(gallery);
        gallery = Array.isArray(parsed) ? parsed : [String(parsed)];
      } catch {
        // assume comma-separated or single string
        gallery = gallery.split?.(",").map((s) => s.trim()).filter(Boolean) || [String(gallery)];
      }
    } else if (!Array.isArray(gallery)) {
      gallery = [String(gallery)];
    }

    // Validate uploaded files (newImages)
    const files = req?.files?.newImages || [];
    if (files.length > 4) {
      return res.status(400).json({ error: "You cannot add more than 4 images at once." });
    }

    // Append uploaded files to gallery array. Expect each file to expose `path` and `originalPath` (or similar).
    // Adjust property names if your upload middleware uses different fields (e.g., filename/webpFilename).
    for (const f of files) {
      if (f?.path) gallery.push(f.path);
      if (f?.originalPath) gallery.push(f.originalPath);
      // fallback checks for common alternate names:
      if (!f?.path && f?.filename) gallery.push(f.filename);
      if (!f?.originalPath && f?.webpFilename) gallery.push(f.webpFilename);
    }

    // Count webp files (assuming webp filenames end with '.webp')
    const webpCount = gallery.filter((item) => typeof item === "string" && item.toLowerCase().endsWith(".webp")).length;

    if (webpCount > 8) {
      return res.status(400).json({ error: "You cannot add more than 8 images in a gallery." });
    }

    const updatedGallery = await Gallery.findByIdAndUpdate(
      objectId,
      {
        $set: {
          title: title ?? existGallery.title,
          gallery,
        },
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Gallery updated successfully.",
      data: updatedGallery,
    });
  } catch (error) {
    console.error("updateGallery Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const deleteGallery = async (req, res) => {
  try {
    const { objectId } = req.params;

    if (!objectId || !mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ error: "Invalid gallery ID." });
    }

    const gallery = await Gallery.findById(objectId);

    if (!gallery) {
      return res.status(404).json({ error: "Gallery not found!" });
    }

    // support both property_id (ObjectId) and propertyId (string) fields depending on your schema
    const propertyIdValue = gallery.property_id ?? gallery.propertyId ?? null;

    // Count galleries for the property (use appropriate field)
    const galleryCount = await Gallery.countDocuments({
      $or: [
        { property_id: propertyIdValue },
        { propertyId: propertyIdValue },
      ],
    });

    await Gallery.findByIdAndDelete(objectId);

    if (galleryCount === 1 && propertyIdValue) {
      await addPropertyScore({
        property_score: -10,
        property_id: String(propertyIdValue),
      });
    }

    return res.status(200).json({ message: "Gallery deleted." });
  } catch (err) {
    console.error("Error deleting gallery:", err);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

export const EditGalleryTitle = async (req, res) => {
  try {
    const { title, objectId } = req.body;

    if (!title || !objectId) {
      return res.status(400).json({ error: "Required fields missing." });
    }

    if (!mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ error: "Invalid gallery ID." });
    }

    const existingGallery = await Gallery.findById(objectId);
    if (!existingGallery) {
      return res.status(404).json({ error: "Gallery not found." });
    }

    await Gallery.findByIdAndUpdate(
      objectId,
      { $set: { title } },
      { new: true }
    );

    return res.status(200).json({ message: "Title updated successfully." });
  } catch (error) {
    console.error("EditGalleryTitle Error:", error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};
