import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import { GalleryImageMover } from "../helper/folder-cleaners/PropertyImageMover.js";
import Gallery from "../models/Gallery.js";
import path from "path";

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
    const uniqueId = req.params.uniqueId;
    const gallery = await Gallery.findOne({ uniqueId: uniqueId });
    return res.status(200).json(gallery);
  } catch (error) {
    console.log(error);
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

    const lastGallery = await Gallery.findOne().sort({ _id: -1 }).limit(1);
    const uniqueId = lastGallery ? lastGallery.uniqueId + 1 : 1;

    const newGallery = new Gallery({
      uniqueId,
      propertyId,
      title,
      gallery,
    });

    const savedGallery = await newGallery.save();
    await GalleryImageMover(req, res, propertyId);

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
    const { uniqueId } = req.params;

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
          message:
            "Uneven number of original and webp images detected in gallery.",
        });
      }
    }

    if (newGalleryImages.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid gallery images provided." });
    }

    const existingGallery = await Gallery.findOne({ uniqueId });

    if (!existingGallery) {
      return res.status(404).json({
        message:
          "Gallery not found for this property. Use the 'createGallery' controller to initialize.",
      });
    }

    const currentCount = existingGallery.gallery.length;
    const totalCount = currentCount + newGalleryImages.length;

    if (totalCount > 16) {
      return res.status(400).json({
        message: `Cannot add more than 8 gallery image pairs. You already have ${
          currentCount / 2
        } pairs.`,
      });
    }

    existingGallery.gallery.push(...newGalleryImages);

    const updatedGallery = await existingGallery.save();

    await GalleryImageMover(req, res, existingGallery.propertyId);

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
    const { uniqueId } = req.params;
    const { webpPaths } = req.body;

    if (!Array.isArray(webpPaths) || webpPaths.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or empty image path array." });
    }

    const galleryDoc = await Gallery.findOne({ uniqueId });
    if (!galleryDoc) {
      return res
        .status(404)
        .json({ message: "No gallery found for this uniqueId." });
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

      const originalPath = galleryDoc.gallery.find((p) => {
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

    const updatedGallery = galleryDoc.gallery.filter(
      (img) => !pathsToRemove.has(img)
    );

    galleryDoc.gallery = updatedGallery;
    await galleryDoc.save();

    return res.status(200).json({
      message: "Selected gallery image references removed from database.",
      data: galleryDoc,
    });
  } catch (error) {
    console.error("Error removing gallery images:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateGallery = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    if (!uniqueId) {
      return res.status(400).json({ error: "Gallery ID is required!" });
    }

    const existGallery = await Gallery.findOne({ uniqueId });
    if (!existGallery) {
      return res.status(404).json({ error: "Gallery not found!" });
    }

    // Parse incoming fields
    let { title, gallery } = req.body;

    gallery = Array.isArray(gallery) ? gallery : [];

    const newGallery = [];

    if (req?.files?.newImages && req?.files?.newImages.length > 4) {
      return res
        .status(400)
        .json({ error: "You Cannot Add More than 4 Images at Once." });
    }

    newGallery.push(gallery);
    if (req?.files?.newImages && req.files.newImages.length > 0) {
      for (let i = 0; i < req.files.newImages.length; i++) {
        gallery.push(req.files.newImages[i]?.path);
      }
      for (let j = 0; j < req.files.newImages.length; j++) {
        gallery.push(req.files.newImages[j]?.originalPath);
      }
    }

    const checkLimit = gallery.filter((item) => item.endsWith(".webp"));

    if (checkLimit.length > 8) {
      return res
        .status(400)
        .json({ error: "You Cannot Add More Than 8 Images in a Gallery" });
    }

    const updateGallery = await Gallery.findOneAndUpdate(
      { uniqueId: uniqueId },
      {
        $set: {
          title: title,
          gallery: gallery,
        },
      },
      { new: true }
    );

    if (updateGallery) {
      return res.status(200).json({
        message: "Gallery updated successfully.",
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const deleteGallery = async (req, res) => {
  try {
    const uniqueId = req.params.uniqueId;

    const gallery = await Gallery.findOne({ uniqueId });

    if (!gallery) {
      return res.status(404).json({ error: "Gallery not found!" });
    }

    const propertyId = gallery.propertyId;

    const galleryCount = await Gallery.countDocuments({ propertyId });

    await Gallery.findOneAndDelete({ uniqueId });

    if (galleryCount === 1) {
      await addPropertyScore({
        property_score: -10,
        property_id: propertyId,
      });
    }

    return res.status(200).json({ message: "Gallery Deleted." });
  } catch (err) {
    console.error("Error deleting gallery:", err);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

export const EditGalleryTitle = async (req, res) => {
  try {
    const { title, uniqueId } = req.body;

    if (!title || !uniqueId) {
      return res.status(400).json({ error: "Required Field Missing" });
    }

    const isExisting = await Gallery.findOne({ uniqueId });
    if (!isExisting) {
      return res.status(400).json({ error: "Gallery Not Found" });
    }

    const updatedTitle = await Gallery.findOneAndUpdate(
      { uniqueId },
      {
        $set: { title },
      }
    );

    if (updatedTitle) {
      return res.status(200).json({ message: "Title Updated Successfully" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};
