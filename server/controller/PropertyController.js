import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import { MainImageMover } from "../helper/folder-cleaners/PropertyImageMover.js";
import ArchiveEnquiry from "../models/ArchiveEnquiry.js";
import Enquiry from "../models/Enquiry.js";
import Review from "../models/Reviews.js";
import PropertySeo from "../models/PropertySeo.js";
import fs from "fs/promises";
import Rank from "../analytic-model/Rank.js";
import Traffic from "../analytic-model/Traffic.js";
import EnquiryCount from "../analytic-model/EnquiryCount.js";
import PropertyScore from "../analytic-model/PropertyScore.js";
import SeoScore from "../analytic-model/SeoScore.js";
import path from "path";
import { fileURLToPath } from "url";
import { downloadImageAndReplaceSrc } from "../helper/folder-cleaners/EditorImagesController.js";
import Category from "../models/Category.js";
import {
  generateSlug,
  getAverageRating,
  normalizePhone,
} from "../utils/Callback.js";
import mongoose from "mongoose";
import { autoAddPropertySeo } from "./PropertySeoController.js";
import Amenities from "../models/Ameniteis.js";
import Faqs from "../models/Faqs.js";
import Gallery from "../models/Gallery.js";
import Location from "../models/Location.js";
import Property from "../models/Property.js";
import PropertyCourse from "../models/PropertyCourse.js";
import Teachers from "../models/Teachers.js";
import Accomodation from "../models/Accomodation.js";
import Scholarship from "../models/PropertyScholarship.js";
import LoanProcess from "../models/LoanProcess.js";
import AdmissionProcess from "../models/AdmissionProcess.js";
import Ranking from "../models/Ranking.js";
import QnA from "../models/QnA.js";
import Announcement from "../models/Announcement.js";

function normalizeAffiliatedBy(affiliated_by) {
  let affiliatedByArray = [];

  if (affiliated_by) {
    if (Array.isArray(affiliated_by)) {
      affiliatedByArray = affiliated_by;
    } else if (typeof affiliated_by === "string") {
      try {
        const parsed = JSON.parse(affiliated_by);
        if (Array.isArray(parsed)) affiliatedByArray = parsed;
        else if (typeof parsed === "string" && parsed.trim()) affiliatedByArray = [parsed];
      } catch (err) {
        if (affiliated_by.includes(",")) {
          affiliatedByArray = affiliated_by.split(",").map((s) => s.trim()).filter(Boolean);
        } else if (affiliated_by.trim()) {
          affiliatedByArray = [affiliated_by.trim()];
        }
      }
    } else {
      affiliatedByArray = [String(affiliated_by)];
    }
  }

  // Keep strings only and filter invalid ObjectId strings.
  return affiliatedByArray
    .map((id) => String(id).trim())
    .filter((id) => mongoose.Types.ObjectId.isValid(id));
}

function normalizeApprovedBy(approved_by) {
  let approvedByArray = [];

  if (approved_by) {
    if (Array.isArray(approved_by)) {
      approvedByArray = approved_by;
    } else if (typeof approved_by === "string") {
      try {
        const parsed = JSON.parse(approved_by);
        if (Array.isArray(parsed)) approvedByArray = parsed;
        else if (typeof parsed === "string" && parsed.trim()) approvedByArray = [parsed];
      } catch (err) {
        if (approved_by.includes(",")) {
          approvedByArray = approved_by.split(",").map((s) => s.trim()).filter(Boolean);
        } else if (approved_by.trim()) {
          approvedByArray = [approved_by.trim()];
        }
      }
    } else {
      approvedByArray = [String(approved_by)];
    }
  }

  // Keep strings only and filter invalid ObjectId strings.
  return approvedByArray
    .map((id) => String(id).trim())
    .filter((id) => mongoose.Types.ObjectId.isValid(id));
}

async function resolveCategoryId(input) {
  if (!input && input !== 0) return null;

  if (typeof input === "string" && mongoose.Types.ObjectId.isValid(input)) {
    return input;
  }

  if (typeof input === "object" && input !== null && input._id) {
    if (mongoose.Types.ObjectId.isValid(String(input._id))) return String(input._id);
  }

  const maybeNum = Number(input);
  if (!Number.isNaN(maybeNum)) {
    const cat = await Category.findOne({ uniqueId: maybeNum }).select("_id");
    if (cat) return String(cat._id);
  }

  return null;
}

async function findCategoryForScoring(input) {
  if (!input && input !== 0) return null;

  if (typeof input === "string" && mongoose.Types.ObjectId.isValid(input)) {
    return await Category.findById(input).lean();
  }

  if (typeof input === "object" && input !== null && input._id) {
    return await Category.findById(String(input._id)).lean();
  }

  const maybeNum = Number(input);
  if (!Number.isNaN(maybeNum)) {
    return await Category.findOne({ uniqueId: maybeNum }).lean();
  }

  return null;
}

export const addProperty = async (req, res) => {
  try {
    let {
      userId,
      property_name,
      property_short_name,
      property_email,
      property_mobile_no,
      academic_type,
      property_type,
      property_description,
    } = req.body;

    if (!userId && !property_name && !property_short_name && !property_email && !property_mobile_no) {
      return res.status(400).json({ error: "All Fields Required" });
    }

    let score = 3;

    const allCategories = await Category.find();
    const currentCategory = allCategories.filter(
      (item) => item._id === academic_type
    );

    if (currentCategory?.[0]?.category_name === "Online Yoga Studio") {
      score += 39;
    } else if (academic_type) {
      score += 1;
    }

    if (property_description) score += 1;
    if (property_type) score += 1;

    if (property_name) {
      property_name = property_name.trim().replace(/\s+/g, " ");
    }

    const existingProperty = await Property.findOne({
      $or: [
        { property_email },
        { property_mobile_no: `+${property_mobile_no}` },
      ],
    });

    if (existingProperty) {
      if (existingProperty.property_email === property_email) {
        return res.status(400).json({
          error: "Property with the same email already exists.",
        });
      }
      if (existingProperty.property_mobile_no === `+${property_mobile_no}`) {
        return res.status(400).json({
          error: "Property with the same mobile number already exists.",
        });
      }
    }

    let baseSlug = property_name.toLowerCase().replace(/ /g, "-");
    let slug = baseSlug;
    let count = 2;

    while (await Property.findOne({ property_slug: slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const lastProperty = await Property.findOne().sort({ _id: -1 }).limit(1);
    const uniqueId = lastProperty ? lastProperty.uniqueId + 1 : 100000;

    let updatedDescription = property_description;
    if (property_description) {
      updatedDescription = await downloadImageAndReplaceSrc(
        property_description,
        uniqueId
      );
    }

    const newProperty = new Property({
      uniqueId,
      userId,
      property_name,
      property_short_name,
      property_email,
      property_mobile_no: `+${property_mobile_no}`,
      academic_type,
      property_type,
      property_logo: [],
      featured_image: [],
      property_description: updatedDescription,
      property_slug: generateSlug(slug),
    });

    const property = await newProperty.save();
    await addPropertyScore({ property_id: uniqueId, property_score: score });
    await autoAddPropertySeo({
      property_id: property?._id,
      title: property_name,
      description: property_description,
      slug: generateSlug(slug),
    });

    return res
      .status(200)
      .json({ message: "Property added successfully.", property: property });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getProperty = async (req, res) => {
  try {
    const property = await Property.find().sort({ createdAt: -1 });
    return res.status(200).json(property);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getPropertyByUniqueId = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const property = await Property.findOne({ uniqueId: uniqueId });
    return res.status(200).json(property);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getPropertyByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const property = await Property.find({ userId: userId });
    return res.status(200).json(property);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const objectId = req.params.objectId;
    const property = await Property.findOne({ _id: objectId });
    return res.status(200).json(property);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};
export const getPropertyBySlug = async (req, res) => {
  try {
    const { property_slug } = req.params;
    const property = await Property.findOne({ property_slug: property_slug });

    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    return res.status(200).json(property);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: "Internal Server Error." });
  }
};

export const getPropertiesMultipleObjectId = async (req, res) => {
  try {
    const { property_ids } = req.body;

    if (
      !property_ids ||
      !Array.isArray(property_ids) ||
      property_ids.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "property_ids must be a non-empty array." });
    }

    // Convert string IDs to ObjectId safely
    const objectIds = property_ids
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (objectIds.length === 0) {
      return res.status(400).json({ error: "No valid property IDs provided." });
    }

    // Fetch all categories
    const categories = await Category.find();
    const matchCategory = (id) => {
      const cat = categories.find(
        (item) => Number(item?.uniqueId) === Number(id)
      );
      return cat?.category_name || null;
    };

    // Fetch properties by MongoDB _id
    const properties = await Property.find({ _id: { $in: objectIds } });

    if (properties.length === 0) {
      return res.status(404).json({ error: "No properties found." });
    }

    // Collect uniqueIds of properties to match with locations/reviews
    const propertyUniqueIds = properties.map((p) => p.uniqueId);

    // Fetch locations and reviews using uniqueId
    const locations = await Location.find({
      property_id: { $in: propertyUniqueIds },
    });
    const reviews = await Review.find({
      property_id: { $in: propertyUniqueIds },
    });

    // Merge data
    const result = properties.map((property) => {
      const propertyLocation = locations.find(
        (loc) => loc.property_id === property.uniqueId
      );

      const propertyReviews = reviews.filter(
        (rev) => rev.property_id === property.uniqueId
      );

      return {
        ...property.toObject(),
        academic_type: matchCategory(property?.category),
        property_type: matchCategory(property?.property_type),
        property_city: propertyLocation?.property_city || null,
        property_state: propertyLocation?.property_state || null,
        property_country: propertyLocation?.property_country || null,
        average_rating: getAverageRating(propertyReviews),
        total_review: propertyReviews?.length || 0,
        property_description: property.property_description || null,
        objectId: property._id,
      };
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const objectId = req.params.objectId;
    if (!objectId) return res.status(400).json({ error: "Missing objectId." });

    // destructure incoming fields
    const {
      property_alt_mobile_no,
      property_description,
      est_year,
      academic_type,
      status,
      property_type,
      property_website,
      affiliated_by,
      approved_by,
    } = req.body;

    // normalize arrays using your existing helpers
    const normalizedAffiliatedBy = normalizeAffiliatedBy(affiliated_by);
    const normalizedApprovedBy = normalizeApprovedBy(approved_by);

    // fetch existing property
    const existProperty = await Property.findById(objectId);
    if (!existProperty) return res.status(404).json({ error: "Property not found." });

    // normalize phone and check conflicts
    const formattedAltMobile = normalizePhone(property_alt_mobile_no);
    if (formattedAltMobile) {
      const phoneConflict = await Property.findOne({
        _id: { $ne: objectId },
        $or: [
          { property_mobile_no: formattedAltMobile },
          { property_alt_mobile_no: formattedAltMobile },
        ],
      });

      if (phoneConflict) {
        return res.status(400).json({
          error: "Alternate mobile number already exists in another property.",
        });
      }

      if (existProperty.property_mobile_no === formattedAltMobile) {
        return res.status(400).json({
          error: "Alternate mobile number cannot be the same as the property's primary mobile number.",
        });
      }
    }

    let updatedDescription = property_description;
    if (property_description) {
      updatedDescription = await downloadImageAndReplaceSrc(property_description, existProperty?.uniqueId);
    }

    const scoringCategory = await findCategoryForScoring(academic_type);

    let score = 0;
    if (!existProperty?.property_alt_mobile_no && property_alt_mobile_no) score += 1;
    if (!existProperty?.property_website && property_website) score += 1;
    if (!existProperty?.property_description && property_description) score += 1;

    if (!existProperty?.academic_type) {
      if (scoringCategory?.category_name === "Online Yoga Studio") {
        score += 39;
      } else if (academic_type) {
        score += 1;
      }
    } else {
      const existingAcademicCat = await Category.findById(existProperty.academic_type).lean().catch(() => null);
      if (existingAcademicCat && existingAcademicCat.category_name === "Online Yoga Studio" && scoringCategory?.category_name !== "Online Yoga Studio") {
        score -= 38;
      }
    }

    if (!existProperty?.est_year && est_year) score += 1;
    if (!existProperty?.property_type && property_type) score += 1;

    const updatedFields = {
      property_description: updatedDescription,
      est_year,
      academic_type,
      status,
      property_type,
      property_website,
    };

    if (affiliated_by !== undefined) updatedFields.affiliated_by = normalizedAffiliatedBy;
    if (approved_by !== undefined) updatedFields.approved_by = normalizedApprovedBy;
    if (formattedAltMobile) updatedFields.property_alt_mobile_no = formattedAltMobile;

    if (updatedFields.academic_type !== undefined) {
      const resolved = await resolveCategoryId(updatedFields.academic_type);
      if (resolved) {
        updatedFields.academic_type = resolved;
      } else {
        delete updatedFields.academic_type;
      }
    }

    Object.keys(updatedFields).forEach((k) => {
      if (updatedFields[k] === undefined || updatedFields[k] === null) delete updatedFields[k];
    });

    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ error: "No valid fields to update." });
    }

    const updatedProperty = await Property.findOneAndUpdate(
      { _id: objectId },
      { $set: updatedFields },
      { new: true }
    );

    await addPropertyScore({
      property_id: existProperty?.uniqueId,
      property_score: score,
    });

    try {
      await autoAddPropertySeo({
        property_id: updatedProperty?._id,
        title: updatedProperty?.property_name,
        description: updatedDescription,
      });
    } catch (seoErr) {
      console.warn("autoAddPropertySeo failed:", seoErr?.message || seoErr);
    }

    return res.json({
      message: "Property updated successfully.",
      result: updatedProperty,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const deleteProperty = async (req, res) => {
  try {
    const objectId = req.params.objectId;
    const property = await Property.findById(objectId);

    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    const uniqueId = property._id;
    const propertyFolder = path.join(__dirname, `../../media/${uniqueId}`);

    await Promise.all([
      Property.findByIdAndDelete(objectId),
      Teachers.deleteMany({ property_id: objectId }),
      Gallery.deleteMany({ propertyId: uniqueId }),
      Review.deleteMany({ property_id: uniqueId }),
      PropertyCourse.deleteMany({ property_id: objectId }),
      Faqs.deleteMany({ property_id: uniqueId }),
      Enquiry.deleteMany({ property_id: objectId }),
      ArchiveEnquiry.deleteMany({ property_id: objectId }),
      Amenities.deleteMany({ propertyId: uniqueId }),
      Location.deleteMany({ property_id: uniqueId }),
      Rank.deleteMany({ property_id: objectId }),
      Traffic.deleteMany({ property_id: objectId }),
      EnquiryCount.deleteMany({ property_id: objectId }),
      PropertySeo.deleteMany({ property_id: objectId }),
      PropertyScore.deleteMany({ property_id: objectId }),
      SeoScore.deleteMany({ property_id: objectId }),
      Accomodation.deleteMany({ property_id: uniqueId }),
      Scholarship.deleteMany({ property_id: uniqueId }),
      LoanProcess.deleteMany({ property_id: uniqueId }),
      AdmissionProcess.deleteMany({ property_id: uniqueId }),
      Ranking.deleteMany({ property_id: uniqueId }),
      QnA.deleteMany({ property_id: uniqueId }),
      Announcement.deleteMany({ property_id: uniqueId }),
    ]);

    try {
      const folderExists = await fs
        .stat(propertyFolder)
        .then(() => true)
        .catch(() => false);

      if (folderExists) {
        await fs.rm(propertyFolder, { recursive: true, force: true });
      }
    } catch (fsError) {
      console.error("Error while deleting folder:", fsError.message);
    }

    return res.json({
      message: "Property and all associated data deleted successfully.",
    });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const updatePropertyImages = async (req, res) => {
  try {
    const objectId = req.params.objectId;
    const property = await Property.findById(objectId);
    let score = 0;

    if (!property) {
      return res.status(404).send({ error: "Property not found!" });
    }

    const iconFile = req.files?.["property_logo"]?.[0];
    const featuredFile = req.files?.["featured_image"]?.[0];

    if (property?.property_logo.length === 0 && iconFile) {
      score += 1;
    }
    if (property?.featured_image.length === 0 && featuredFile) {
      score += 1;
    }
    const updates = {};

    if (iconFile) {
      updates.property_logo = [
        iconFile.webpFilename,
        iconFile.originalFilename,
      ];
    }

    if (featuredFile) {
      updates.featured_image = [
        featuredFile.webpFilename,
        featuredFile.originalFilename,
      ];
    }

    if (Object.keys(updates).length > 0) {
      await Property.findByIdAndUpdate(objectId, { $set: updates });
    }

    if (iconFile) {
      await MainImageMover(req, res, property.uniqueId, "property_logo");
    }

    if (featuredFile) {
      await MainImageMover(req, res, property.uniqueId, "featured_image");
    }

    await addPropertyScore({
      property_id: property?.uniqueId,
      property_score: score,
    });

    return res.status(200).send({ message: "Images updated successfully." });
  } catch (err) {
    console.error("Error updating property images:", err);
    return res.status(500).send({ error: "Internal Server Error." });
  }
};

export const PropertySlugGenerator = async (req, res) => {
  try {
    const properties = await Property.find();
    const locations = await Location.find();
    const seos = await PropertySeo.find();

    for (const property of properties) {
      const locat = locations?.find(
        (item) => item?.property_id === property?.uniqueId
      );

      if (!locat) continue;

      const baseSlug = `${generateSlug(property?.property_name)}-${generateSlug(
        locat?.property_city
      )}`;
      let slug = baseSlug;
      let counter = 2;

      // If property already has a slug, check if it's valid/unique
      if (property.property_slug) {
        const conflict = await Property.findOne({
          property_slug: property.property_slug,
          uniqueId: { $ne: property?.uniqueId },
        });

        if (!conflict && property.property_slug.startsWith(baseSlug)) {
          // Keep the existing slug, but ensure Seo matches
          const seoDoc = seos.find(
            (s) => s?.property_id === property?.uniqueId
          );
          if (seoDoc && seoDoc.slug !== property.property_slug) {
            await PropertySeo.findOneAndUpdate(
              { property_id: property?.uniqueId },
              { $set: { slug: property.property_slug } }
            );
            console.log(
              "SEO synced:",
              property.property_slug,
              property.uniqueId
            );
          }
          continue;
        }
      }

      // Ensure uniqueness for Property slugs
      while (
        await Property.findOne({
          property_slug: slug,
          uniqueId: { $ne: property?.uniqueId },
        })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const updatePropertySlug = await Property.findOneAndUpdate(
        { uniqueId: property?.uniqueId },
        { $set: { property_slug: generateSlug(slug) } },
        { new: true }
      );

      await PropertySeo.findOneAndUpdate(
        { property_id: property?.uniqueId },
        { $set: { slug: generateSlug(slug) } }
      );

      console.log(
        "Updated:",
        updatePropertySlug?.property_slug,
        updatePropertySlug?.uniqueId
      );
    }

    res.status(200).json({ message: "Slugs generated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
