import axios from "axios";
import * as cheerio from "cheerio";
import sharp from "sharp";
import * as fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const processImage = async (src, folderPath, mediaUrlPrefix, img) => {
  try {
    const parsed = new URL(src, "http://localhost");
    const protocol = parsed.protocol;

    if (src.startsWith(mediaUrlPrefix)) return;

    await delay(1);
    const timestamp = Date.now();

    if (protocol === "data:") {
      const [, format, base64] =
        src.match(/data:image\/(png|jpg|jpeg|gif);base64,(.+)/) || [];
      if (!format || !base64) {
        console.error("Invalid Base64 image format:", src.slice(0, 50));
        return;
      }

      const buffer = Buffer.from(base64, "base64");
      const originalFile = `img-editor-${timestamp}.${format}`;
      const webpFile = `img-editor-${timestamp}-compressed.webp`;

      const originalPath = path.join(folderPath, originalFile);
      const webpPath = path.join(folderPath, webpFile);

      fs.writeFileSync(originalPath, buffer);
      await sharp(buffer).webp({ quality: 40 }).toFile(webpPath);

      img.attr("src", `${mediaUrlPrefix}/${webpFile}`);
    } else if (protocol === "http:" || protocol === "https:") {
      const response = await axios.get(src, { responseType: "arraybuffer" });

      const contentType = response.headers["content-type"];
      const ext = contentType?.split("/")[1]?.split(";")[0] || "jpg";
      const originalFile = `img-editor-${timestamp}.${ext}`;
      const webpFile = `img-editor-${timestamp}-compressed.webp`;

      const originalPath = path.join(folderPath, originalFile);
      const webpPath = path.join(folderPath, webpFile);

      fs.writeFileSync(originalPath, response.data);
      await sharp(response.data).webp({ quality: 40 }).toFile(webpPath);

      img.attr("src", `${mediaUrlPrefix}/${webpFile}`);
    } else {
      console.warn(`Unsupported protocol (${protocol}) in image src: ${src}`);
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`Image not found (404): ${src}`);
      img.remove();
    } else {
      console.error(`Failed to process image from ${src}:`, error.message);
    }
  }
};

export const downloadImageAndReplaceSrc = async (htmlContent, propertyId) => {
  const $ = cheerio.load(htmlContent);
  const downloadPromises = [];

  const propertyMediaDir = path.join(
    __dirname,
    `../../../media/${propertyId}/editor`
  );
  const mediaUrlPrefix = `${process.env.MEDIA_URL}/${propertyId}/editor`;

  if (!fs.existsSync(propertyMediaDir)) {
    fs.mkdirSync(propertyMediaDir, { recursive: true });
  }

  $("img").each(function () {
    const img = $(this);
    const src = img.attr("src");
    if (!src) return;

    const promise = processImage(src, propertyMediaDir, mediaUrlPrefix, img);
    downloadPromises.push(promise);
  });

  await Promise.all(downloadPromises);
  return $.html();
};

export const downloadImageAndReplaceSrcNonProperty = async (
  htmlContent,
  folder_name
) => {
  if (!htmlContent || !folder_name) {
    console.error("Invalid input: htmlContent or folder_name is missing");
    return htmlContent;
  }

  const $ = cheerio.load(htmlContent);
  const downloadPromises = [];

  const propertyMediaDir = path.join(
    __dirname,
    `../../../media/${folder_name}/editor`
  );
  const mediaUrlPrefix = `${process.env.MEDIA_URL}/${folder_name}/editor`;

  if (!fs.existsSync(propertyMediaDir)) {
    fs.mkdirSync(propertyMediaDir, { recursive: true });
  }

  $("img").each(function () {
    const img = $(this);
    const src = img.attr("src");
    if (!src) return;

    const promise = processImage(src, propertyMediaDir, mediaUrlPrefix, img);
    downloadPromises.push(promise);
  });

  await Promise.all(downloadPromises);
  return $.html();
};

export const downloadImageAndReplaceSrcByProfile = async (htmlContent, userId) => {
  const $ = cheerio.load(htmlContent);
  const downloadPromises = [];

  const propertyMediaDir = path.join(
    __dirname,
    `../../../media/profile/${userId}/editor`
  );
  const mediaUrlPrefix = `${process.env.MEDIA_URL}/profile/${userId}/editor`;

  if (!fs.existsSync(propertyMediaDir)) {
    fs.mkdirSync(propertyMediaDir, { recursive: true });
  }

  $("img").each(function () {
    const img = $(this);
    const src = img.attr("src");
    if (!src) return;

    const promise = processImage(src, propertyMediaDir, mediaUrlPrefix, img);
    downloadPromises.push(promise);
  });

  await Promise.all(downloadPromises);
  return $.html();
};