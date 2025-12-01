import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import RegularUser from "../../profile-model/RegularUser.js";
import ProfileDoc from "../../profile-model/ProfileDoc.js";

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const ProfileMainImageMover = async (req, res, userId, fieldName) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const oldDir = path.join(__dirname, "../../images");
    const newDir = path.join(
      __dirname,
      `../../../media/profile/${userId}/main`
    );
    await fs.mkdir(newDir, { recursive: true });

    const user = await RegularUser.findOne({ uniqueId: userId });
    if (!user) {
      console.warn(`User not found for ID: ${userId}`);
      return;
    }

    if (!["avatar", "banner"].includes(fieldName)) {
      console.warn(`Invalid field name: ${fieldName}`);
      return;
    }

    const imageArray = user[fieldName];
    if (!Array.isArray(imageArray) || imageArray.length === 0) {
      console.warn(`No images found in field: ${fieldName}`);
      return;
    }

    const updatedImagePaths = [];
    const skippedFiles = [];

    for (const imgPath of imageArray) {
      const imgName = imgPath.split(/\\|\//).pop();

      // If already moved
      if (imgPath.startsWith(`${userId}/main/`)) {
        updatedImagePaths.push(imgPath);
        continue;
      }

      const oldPath = path.join(oldDir, imgName);
      const newPath = path.join(newDir, imgName);

      if (await fileExists(oldPath)) {
        try {
          await fs.rename(oldPath, newPath);
          updatedImagePaths.push(`/profile/${userId}/main/${imgName}`);
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
      user[fieldName] = updatedImagePaths;
      await user.save();
      console.log(`${fieldName} images for user ${userId} updated.`);

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

export const ProfileResumeMover = async (req, res, userId) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const oldDir = path.join(__dirname, "../../images");
    const newDir = path.join(
      __dirname,
      `../../../media/profile/${userId}/resume`
    );

    await fs.mkdir(newDir, { recursive: true });

    const doc = await ProfileDoc.findOne({ userId: userId });
    if (!doc) {
      console.warn(`User not found for ID: ${userId}`);
      return;
    }

    const resumePath = doc.resume;

    if (!resumePath || typeof resumePath !== "string") {
      console.warn("No resume path found or invalid type.");
      return;
    }

    const resumeName = resumePath.split(/\\|\//).pop();

    // If already moved
    if (resumePath.startsWith(`/profile/${userId}/resume/`)) {
      console.log("Resume already moved. No action needed.");
      return;
    }

    const oldPath = path.join(oldDir, resumeName);
    const newPath = path.join(newDir, resumeName);

    if (await fileExists(oldPath)) {
      try {
        await fs.rename(oldPath, newPath);
        doc.resume = `/profile/${userId}/resume/${resumeName}`;
        await doc.save();
        console.log(`Resume moved and updated for user ${userId}.`);
      } catch (err) {
        console.error(`Failed to move resume: ${err.message}`);
      }
    } else {
      console.warn(`Resume file not found at ${oldPath}`);
    }
  } catch (error) {
    console.error("Error in ProfileResumeMover:", error);
  }
};
