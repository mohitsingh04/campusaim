import PropertyScore from "../analytic-model/PropertyScore.js";
import mongoose from "mongoose";
import Property from "../models/Property.js";
import Location from "../models/Location.js";
import Accomodation from "../models/Accomodation.js";
import BusinessHour from "../models/BusinessHour.js";
import Amenities from "../models/Ameniteis.js";
import Faqs from "../models/Faqs.js";
import Gallery from "../models/Gallery.js";
import PropertyCourse from "../models/PropertyCourse.js";
import Teachers from "../models/Teachers.js";
import PropertyRetreat from "../models/PropertyRetreat.js";
import Certifications from "../models/Certifications.js";
import Category from "../models/Category.js";

export const addPropertyScore = async ({ property_id, property_score }) => {
  try {
    // 1️⃣ Validate input presence
    if (!property_id || property_score == null) {
      throw new Error("Both property_id and property_score are required");
    }

    let finalPropertyId;

    if (!isNaN(property_id)) {
      const numericId = Number(property_id);
      const property = await Property.findOne({ uniqueId: numericId });
      if (!property) throw new Error("Property not found for given numeric ID");
      finalPropertyId = property._id;
    }

    // Else if it's a valid ObjectId string
    else if (mongoose.Types.ObjectId.isValid(property_id)) {
      finalPropertyId = new mongoose.Types.ObjectId(property_id);
    }

    // Otherwise invalid
    else {
      throw new Error(
        "Invalid property_id format — must be numeric or ObjectId"
      );
    }

    // 3️⃣ Find existing PropertyScore by property_id (ObjectId)
    const existingScore = await PropertyScore.findOne({
      property_id: finalPropertyId,
    });

    if (existingScore) {
      existingScore.property_score += property_score;
      await existingScore.save();
    } else {
      const lastScore = await PropertyScore.findOne().sort({ uniqueId: -1 });
      const uniqueId = lastScore ? lastScore.uniqueId + 1 : 1;

      const newScore = new PropertyScore({
        uniqueId,
        property_score,
        property_id: finalPropertyId,
      });

      await newScore.save();
    }

    return { success: true, message: "Property score added successfully" };
  } catch (error) {
    console.error("Error adding property score:", error.message);
    throw new Error(error.message || "Internal Server Error");
  }
};

export const getPropertyScoreById = async (req, res) => {
  try {
    const { property_id } = req.params;

    if (!property_id) {
      return res.status(400).json({ error: "Property ID is required" });
    }

    const score = await PropertyScore.findOne({ property_id });

    if (!score) {
      return res.status(404).json({ error: "Property score not found" });
    }

    return res.status(200).json(score);
  } catch (error) {
    console.error("Error fetching property score:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const getAllPropertyScore = async (req, res) => {
  try {
    const score = await PropertyScore.find();

    if (!score) {
      return res.status(404).json({ error: "Property score not found" });
    }

    return res.status(200).json(score);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// points config
const itemScores = {
  property_name: { point: 2, online: true },
  property_email: { point: 2, online: true },
  property_mobile_no: { point: 2, online: true },
  property_logo: { point: 2, online: true },
  featured_image: { point: 2, online: true },
  property_description: { point: 2, online: true },
  category: { point: 2, online: true },
  property_type: { point: 2, online: true },
  property_website: { point: 1, online: true },
  est_year: { point: 2, online: true },
  property_alt_mobile_no: { point: 1, online: true },
  property_address: { point: 2, online: false },
  property_pincode: { point: 2, online: false },
  property_city: { point: 2, online: false },
  property_state: { point: 2, online: false },
  property_country: { point: 2, online: false },
  accomdation: { point: 5, online: false },
  business_hours: { point: 10, online: false },
  amenities: { point: 10, online: false },
  faqs: { point: 5, online: true },
  gallery: { point: 10, online: true },
  courses: { point: 10, online: true },
  teachers: { point: 5, online: true },
  retreats: { point: 10, online: true },
  certifications: { point: 5, online: true },
};

export const generatePropertyScores = async (req, res) => {
  try {
    const [
      properties,
      locations,
      accomodations,
      businessHours,
      amenities,
      faqs,
      galleries,
      certifications,
      propertyCourses,
      teachers,
      propertyRetreats,
    ] = await Promise.all([
      Property.find(),
      Location.find(),
      Accomodation.find(),
      BusinessHour.find(),
      Amenities.find(),
      Faqs.find(),
      Gallery.find(),
      Certifications.find(),
      PropertyCourse.find(),
      Teachers.find(),
      PropertyRetreat.find(),
    ]);

    const onlineCategory = await Category.findOne({
      category_name: "Online Yoga Studio",
    });
    const onlineId = onlineCategory?.uniqueId;

    if (!properties.length)
      return res.status(404).json({ message: "No properties found" });

    const toPlain = (doc) =>
      doc && typeof doc.toObject === "function" ? doc.toObject() : doc || {};

    const mergedData = properties.map((propertyDoc) => {
      const prop = toPlain(propertyDoc);

      const loc = toPlain(
        locations.find((l) => Number(l.property_id) === Number(prop.uniqueId))
      );
      const acc = accomodations.find(
        (a) => Number(a.property_id) === Number(prop.uniqueId)
      );
      const bh = businessHours.find(
        (b) => Number(b.property_id) === Number(prop.uniqueId)
      );
      const amen = amenities.find(
        (a) => Number(a.propertyId) === Number(prop.uniqueId)
      );
      const faq = faqs.filter(
        (f) => Number(f.property_id) === Number(prop.uniqueId)
      );
      const gal = galleries.filter(
        (g) => Number(g.propertyId) === Number(prop.uniqueId)
      );
      const courses = propertyCourses.filter(
        (c) => String(c.property_id) === String(prop._id)
      );
      const teacherList = teachers.filter(
        (t) => Number(t.property_id) === Number(prop.uniqueId)
      );
      const retreatList = propertyRetreats.filter(
        (r) => String(r.property_id) === String(prop._id)
      );
      const certifcationList = certifications.find(
        (r) => Number(r.property_id) === Number(prop.uniqueId)
      );

      return {
        ...loc,
        ...prop,
        accomdation: acc ? [acc] : [],
        business_hours: bh || {},
        amenities: amen?.selectedAmenities || [],
        faqs: faq.map(toPlain),
        gallery: gal.map(toPlain),
        courses: courses.map(toPlain),
        teachers: teacherList.map(toPlain),
        retreats: retreatList.map(toPlain),
        certifications: certifcationList?.certifications || [],
      };
    });

    const exemptKeys = Object.entries(itemScores)
      .filter(([k, cfg]) => cfg.online === false)
      .map(([k]) => k);

    const results = [];

    for (const p of mergedData) {
      let score = 0;
      const breakdown = {};

      const isOnline =
        String(p.category) === String(onlineId) ||
        p.isOnline === true ||
        p.online === true;

      for (const [key, config] of Object.entries(itemScores)) {
        const { point, online } = config;
        const val = p[key];
        let exists = false;

        breakdown[key] = { point: 0, online, awarded: 0 };

        if (isOnline && exemptKeys.includes(key)) continue; // skip, add later

        if (val === null || val === undefined) exists = false;
        else if (typeof val === "string") exists = val.trim().length > 0;
        else if (Array.isArray(val)) exists = val.length > 0;
        else if (typeof val === "object") exists = Object.keys(val).length > 0;
        else if (typeof val === "number" || typeof val === "boolean")
          exists = true;

        if (exists) {
          score += point;
          breakdown[key].awarded = point;
        }
      }

      if (isOnline) {
        // Force full 35 pts for online-exempt fields
        for (const k of exemptKeys) {
          const pts = itemScores[k].point;
          score += pts;
          breakdown[k].awarded = pts;
        }
      }

      const propertyId = p._id;

      await PropertyScore.updateOne(
        { property_id: propertyId },
        {
          $set: {
            property_id: propertyId,
            property_score: score,
            is_online: isOnline,
          },
        },
        { upsert: true }
      );

      results.push({
        property_id: propertyId,
        uniqueId: propertyId,
        property_name: p.property_name,
        property_score: score,
        is_online: isOnline,
        breakdown,
      });
    }

    return res.status(200).json({
      message: "Property scores generated successfully",
      total: results.length,
      scores: results,
    });
  } catch (error) {
    console.error("Error generating property scores:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message || error,
    });
  }
};
