import path from "path";

export const ROOT_DIR = process.cwd(); // project root

export const MEDIA_ROOT = path.join(ROOT_DIR, "media");
export const TEMP_DIR = path.join(MEDIA_ROOT, "temp");

export const getUserDocsDir = (userId) =>
    path.join(MEDIA_ROOT, "documents", userId);