export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const normalizePhone = (num) => {
  if (!num) return null;
  let cleaned = num.toString().trim().replace(/\s+/g, "");
  cleaned = cleaned.replace(/^\++/, "+");
  if (!cleaned.startsWith("+")) {
    cleaned = `+${cleaned}`;
  }

  return cleaned;
};

export const getAverageRating = (reviews) => {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;
  const total = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
  return Number((total / reviews.length).toFixed(1));
};

export const getUploadedFilePaths = (req, fieldName) => {
  try {
    if (!req.files || !req.files[fieldName]) return [];

    const paths = req.files[fieldName].flatMap((file) => {
      const webp = file.webpFilename || null;
      const original = file.originalFilename || null;
      return [webp, original].filter(Boolean);
    });

    return paths;
  } catch (error) {
    console.error("Error extracting file paths:", error);
    return [];
  }
};

export const generateUniqueId = async (model) => {
  const latestDoc = await model.findOne().sort({ uniqueId: -1 }).lean();
  return latestDoc ? latestDoc.uniqueId + 1 : 1;
};

export const calculateSeoScore = ({
  title,
  slug,
  meta_description,
  primary_focus_keyword,
}) => {
  let seo_score = 0;

  if (title && title.trim() !== "") seo_score += 25;
  if (slug && slug.trim() !== "") seo_score += 25;
  if (meta_description && meta_description.trim() !== "") seo_score += 25;

  if (primary_focus_keyword && Array.isArray(primary_focus_keyword)) {
    const keywordCount = Math.min(primary_focus_keyword.length, 2);
    seo_score += keywordCount * 12.5;
  }

  return seo_score?.toFixed(1);
};

// utils/stripHtml.js
export const stripHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
};
