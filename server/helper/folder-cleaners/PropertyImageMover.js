import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Property from "../../models/Property.js";
import Teachers from "../../models/Teachers.js";
import Gallery from "../../models/Gallery.js";
import Accomodation from "../../models/Accomodation.js";
import PropertyVerificationDocs from "../../models/PropertyVerificationDocs.js";

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};
export const MainImageMover = async (req, res, propertyId, fieldName) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const oldDir = path.join(__dirname, "../../images");
    const newDir = path.join(__dirname, `../../../media/${propertyId}/main`);
    await fs.mkdir(newDir, { recursive: true });

    const property = await Property.findOne({ uniqueId: propertyId });
    if (!property) {
      console.warn(`Property not found for ID: ${propertyId}`);
      return;
    }

    if (!["property_logo", "featured_image"].includes(fieldName)) {
      console.warn(`Invalid field name: ${fieldName}`);
      return;
    }

    const imageArray = property[fieldName];
    if (!Array.isArray(imageArray) || imageArray.length === 0) {
      console.warn(`No images found in field: ${fieldName}`);
      return;
    }

    const updatedImagePaths = [];
    const skippedFiles = [];

    for (const imgPath of imageArray) {
      const imgName = imgPath.split(/\\|\//).pop();

      // If already moved
      if (imgPath.startsWith(`${propertyId}/main/`)) {
        updatedImagePaths.push(imgPath);
        continue;
      }

      const oldPath = path.join(oldDir, imgName);
      const newPath = path.join(newDir, imgName);

      if (await fileExists(oldPath)) {
        try {
          await fs.rename(oldPath, newPath);
          updatedImagePaths.push(`${propertyId}/main/${imgName}`);
        } catch (err) {
          console.warn(`Failed to move ${imgName}: ${err.message}`);
          skippedFiles.push(imgName);
        }
      } else {
        console.warn(`File not found: ${oldPath}`);
        skippedFiles.push(imgName);
      }
    }

    if (updatedImagePaths.length > 0) {
      property[fieldName] = updatedImagePaths;
      await property.save();
      console.log(`${fieldName} images for property ${propertyId} updated.`);

      if (skippedFiles.length > 0) {
        console.warn(`Some files were skipped: ${skippedFiles.join(", ")}`);
      }
    } else {
      console.warn(`No files were moved. Nothing saved for ${fieldName}`);
    }
  } catch (error) {
    console.error("Error in MainImageMover:", error);
  }
};

export const GalleryImageMover = async (req, res, propertyId) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const oldDir = path.join(__dirname, "../../images");
    const newDir = path.join(__dirname, `../../../media/${propertyId}/gallery`);
    await fs.mkdir(newDir, { recursive: true });

    const property = await Property.findOne({ uniqueId: propertyId });
    if (!property) {
      console.warn(`Property not found for ID: ${propertyId}`);
      return;
    }

    const galleryEntries = await Gallery.find({ propertyId: propertyId });

    for (const gallery of galleryEntries) {
      if (!Array.isArray(gallery.gallery)) continue;

      const updatedGalleryPaths = [];

      for (const imgPath of gallery.gallery) {
        const imgName = imgPath.split(/\\|\//).pop();

        if (imgPath.startsWith(`${propertyId}/gallery/`)) {
          updatedGalleryPaths.push(imgPath);
          continue;
        }

        const oldPath = path.join(oldDir, imgName);
        const newPath = path.join(newDir, imgName);

        if (await fileExists(oldPath)) {
          try {
            await fs.rename(oldPath, newPath);
            updatedGalleryPaths.push(`${propertyId}/gallery/${imgName}`);
          } catch (moveErr) {
            console.warn(`Failed to move ${imgName}: ${moveErr.message}`);
          }
        } else {
          console.warn(`File not found: ${oldPath}`);
        }
      }

      if (updatedGalleryPaths.length === gallery.gallery.length) {
        gallery.gallery = updatedGalleryPaths;
        await gallery.save();
      }
    }

    console.log(
      `Gallery images for property ${propertyId} moved successfully.`
    );
  } catch (error) {
    console.error("Error in GalleryImageMover:", error);
  }
};

export const AccomodationImageMover = async (req, res, propertyId) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const oldDir = path.join(__dirname, "../../images");
    const newDir = path.join(
      __dirname,
      `../../../media/${propertyId}/accomodation`
    );
    await fs.mkdir(newDir, { recursive: true });

    const property = await Property.findOne({ uniqueId: propertyId });
    if (!property) {
      console.warn(`Property not found for ID: ${propertyId}`);
      return;
    }

    const AccomodationEntries = await Accomodation.find({
      property_id: propertyId,
    });

    for (const accomodaion of AccomodationEntries) {
      if (!Array.isArray(accomodaion.accomodation_images)) continue;

      const updatedAccomodationPaths = [];

      for (const imgPath of accomodaion.accomodation_images) {
        const imgName = imgPath.split(/\\|\//).pop();

        if (imgPath.startsWith(`${propertyId}/accomodation/`)) {
          updatedAccomodationPaths.push(imgPath);
          continue;
        }

        const oldPath = path.join(oldDir, imgName);
        const newPath = path.join(newDir, imgName);

        if (await fileExists(oldPath)) {
          try {
            await fs.rename(oldPath, newPath);
            updatedAccomodationPaths.push(
              `${propertyId}/accomodation/${imgName}`
            );
          } catch (moveErr) {
            console.warn(`Failed to move ${imgName}: ${moveErr.message}`);
          }
        } else {
          console.warn(`File not found: ${oldPath}`);
        }
      }

      if (
        updatedAccomodationPaths.length ===
        accomodaion.accomodation_images.length
      ) {
        accomodaion.accomodation_images = updatedAccomodationPaths;
        await accomodaion.save();
      }
    }

    console.log(
      `Accomodaion images for property ${propertyId} moved successfully.`
    );
  } catch (error) {
    console.error("Error in AccomodaionImageMover:", error);
  }
};
export const TeacherImageMover = async (req, res, propertyId) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const oldDir = path.join(__dirname, "../../images");
    const newDir = path.join(
      __dirname,
      `../../../media/${propertyId}/teachers`
    );
    await fs.mkdir(newDir, { recursive: true });

    const teachers = await Teachers.find({ property_id: propertyId });

    for (const teacher of teachers) {
      // 🚀 SKIP teachers with no images
      if (!teacher.profile || teacher.profile.length === 0) {
        continue;
      }

      const newProfilePaths = [];
      const skippedFiles = [];

      for (const imgPath of teacher.profile) {
        if (!imgPath || typeof imgPath !== "string") {
          continue; // silently skip null or invalid entries
        }

        const imgName = imgPath.split(/\\|\//).pop();
        if (!imgName) continue;

        // If already moved
        if (imgPath.startsWith(`${propertyId}/teachers/`)) {
          newProfilePaths.push(imgPath);
          continue;
        }

        const oldPath = path.join(oldDir, imgName);
        const newPath = path.join(newDir, imgName);

        const exists = await fileExists(oldPath);
        if (!exists) continue;

        try {
          await fs.copyFile(oldPath, newPath);
          await fs.unlink(oldPath);
          newProfilePaths.push(`${propertyId}/teachers/${imgName}`);
        } catch (err) {
          console.log(err);
          skippedFiles.push(imgName);
        }
      }

      if (newProfilePaths.length === 2) {
        teacher.profile = newProfilePaths;
        await teacher.save();
      }
    }
  } catch (error) {
    console.error("Error in TeacherImageMover:", error);
  }
};

export const verificationDocsImageMover = async (req, res, id) => {
  try {
    const property = await Property.findOne({ _id: id });
    const property_id = property?.uniqueId;
    const docData = await PropertyVerificationDocs.findOne({ property_id: id });

    if (!docData) {
      console.warn(
        `No verification docs found for property_id: ${property_id}`
      );
      return;
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const oldDir = path.join(__dirname, "../../images");
    const baseNewDir = path.join(
      __dirname,
      `../../../media/${property_id}/verification`
    );
    await fs.mkdir(baseNewDir, { recursive: true });

    // Helper to move files for a given field
    const moveFiles = async (fieldName, folderName) => {
      const files = docData[fieldName];
      if (!Array.isArray(files)) return [];

      const newDir = path.join(baseNewDir, folderName);
      await fs.mkdir(newDir, { recursive: true });

      const updatedPaths = [];

      for (const fileName of files) {
        // Skip if already moved
        if (
          fileName.startsWith(`/${property_id}/verification/${folderName}/`)
        ) {
          updatedPaths.push(fileName);
          continue;
        }

        const oldPath = path.join(oldDir, fileName);
        const newPath = path.join(newDir, fileName);

        if (await fileExists(oldPath)) {
          try {
            await fs.rename(oldPath, newPath);
            updatedPaths.push(
              `/${property_id}/verification/${folderName}/${fileName}`
            );
          } catch (err) {
            console.warn(`Failed to move ${fileName}: ${err.message}`);
          }
        } else {
          console.warn(`File not found: ${oldPath}`);
        }
      }

      return updatedPaths;
    };

    // Move both categories
    const updatedBusinessProofs = await moveFiles(
      "business_identity_proof",
      "business_identity_proof"
    );
    const updatedLocationProofs = await moveFiles(
      "location_proof",
      "location_proof"
    );

    // Update in DB
    docData.business_identity_proof = updatedBusinessProofs;
    docData.location_proof = updatedLocationProofs;
    await docData.save();

    console.log(
      "Verification documents moved and database updated successfully."
    );
  } catch (error) {
    console.error("Error in verificationDocsImageMover:", error);
  }
};
