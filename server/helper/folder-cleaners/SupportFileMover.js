import fs from "fs";
import path from "path";

export const moveSupportFiles = async (supportId, fileNames) => {
  try {
    const baseDir = path.resolve("../media/support");
    const targetDir = path.join(baseDir, supportId.toString());

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const movedFiles = [];

    for (const file of fileNames) {
      const oldPath = path.join(baseDir, file);
      const newPath = path.join(targetDir, file);

      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);

        const relativePath = path.join("support", supportId.toString(), file);
        movedFiles.push(relativePath.replace(/\\/g, "/"));
      } else {
        console.warn(`File not found: ${oldPath}`);
      }
    }

    // ✅ Return updated DB paths
    return movedFiles;
    // Example output:
    // ["media/support/66c3b6f2c65e89a3b245ea12/file1.png"]
  } catch (error) {
    console.error("Error moving support files:", error);
    throw error;
  }
};
