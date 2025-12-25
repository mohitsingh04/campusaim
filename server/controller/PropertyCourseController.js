import mongoose from "mongoose";
import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import Course from "../models/Courses.js";
import PropertyCourse from "../models/PropertyCourse.js";
import { generateUniqueId } from "../utils/Callback.js";

const tryParseJSON = (v) => {
  if (typeof v !== "string") return v;
  try { return JSON.parse(v); } catch { return v; }
};

const isEmptyValue = (v) => {
  if (v === undefined || v === null) return true;
  if (typeof v === "string" && v.trim() === "") return true;
  if (Array.isArray(v) && v.length === 0) return true;
  if (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0) return true;
  return false;
};

const toObjectIdIfValid = (val) => {
  if (val instanceof mongoose.Types.ObjectId) return val;
  if (typeof val === "object" && val !== null && val._id && mongoose.Types.ObjectId.isValid(String(val._id))) {
    return new mongoose.Types.ObjectId(String(val._id));
  }
  if (typeof val === "string" && mongoose.Types.ObjectId.isValid(val)) {
    return new mongoose.Types.ObjectId(val);
  }
  return val;
};

export const getPropertyCourse = async (req, res) => {
  try {
    const propertyCourse = await PropertyCourse.find();
    return res.status(200).json(propertyCourse);
  } catch (error) {
    console.error(error);
    return res.send({ error: "Internal Server Error" });
  }
};

export const getPropertyCourseById = async (req, res) => {
  try {
    const objectId = req.params.objectId;
    const propertyCourse = await PropertyCourse.findOne({ _id: objectId });
    return res.status(200).json(propertyCourse);
  } catch (error) {
    console.error(error);
    return res.send({ error: "Internal Server Error" });
  }
};

export const getPropertyCourseByUniqueId = async (req, res) => {
  try {
    const uniqueId = req.params.uniqueId;
    const propertyCourse = await PropertyCourse.findOne({ uniqueId: uniqueId });
    return res.status(200).json(propertyCourse);
  } catch (error) {
    console.error(error);
    return res.send({ error: "Internal Server Error" });
  }
};

export const getPropertyCourseByPropertyId = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    const propertyCourse = await PropertyCourse.find({
      property_id: propertyId,
    });
    return res.status(200).json(propertyCourse);
  } catch (error) {
    console.error(error);
    return res.send({ error: "Internal Server Error" });
  }
};

export const addPropertyCourse = async (req, res) => {
  try {
    const {
      userId,
      course_id,
      property_id,
      course_short_name,
      specialization,
      duration,
      course_type,
      program_type,
      course_eligibility,
      prices,
      best_for,
    } = req.body;

    if (!userId || !course_id || !property_id) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const existingCourse = await PropertyCourse.findOne({
      property_id,
      course_id,
    });

    if (existingCourse) {
      return res.status(400).json({ error: "This course already exists." });
    }

    const baseCourse = await Course.findOne({ _id: course_id });
    if (!baseCourse) {
      return res
        .status(404)
        .json({ error: "Course not found in Course collection." });
    }

    const nextUniqueId = await generateUniqueId(PropertyCourse);

    const existingCourseCount = await PropertyCourse.countDocuments({
      property_id,
    });

    const propertyCourseFields = [
      "course_type",
      "course_short_name",
      "specialization",
      "program_type",
      "course_eligibility",
      "duration",
      "prices",
      "best_for",
    ];

    const inputData = {
      course_type,
      course_short_name,
      specialization,
      program_type,
      course_eligibility,
      prices,
      duration,
      best_for,
    };

    const arrayFieldsWithTypes = {
      best_for: "object",
    };

    const arraysAreEqual = (a, b) => {
      return JSON.stringify(a) === JSON.stringify(b);
    };

    const newCourseData = {
      userId,
      course_id,
      uniqueId: nextUniqueId,
      property_id,
    };

    for (const field of propertyCourseFields) {
      const inputVal = inputData[field];
      const baseVal = baseCourse[field];

      if (typeof inputVal === "undefined") continue;

      const expectedType = arrayFieldsWithTypes[field];

      if (Array.isArray(inputVal) && Array.isArray(baseVal)) {
        const inputIsExpected = inputVal.every(
          (item) => typeof item === expectedType
        );
        const baseIsExpected = baseVal.every(
          (item) => typeof item === expectedType
        );

        if (
          !inputIsExpected ||
          !baseIsExpected ||
          !arraysAreEqual(inputVal, baseVal)
        ) {
          newCourseData[field === "price" ? "prices" : field] = inputVal;
        }
      } else {
        if (JSON.stringify(inputVal) !== JSON.stringify(baseVal)) {
          newCourseData[field === "price" ? "prices" : field] = inputVal;
        }
      }
    }

    const newCourse = new PropertyCourse(newCourseData);
    await newCourse.save();

    if (existingCourseCount === 0) {
      await addPropertyScore({
        property_score: 10,
        property_id: property_id,
      });
    }

    return res.status(200).json({ message: "Course added successfully." });
  } catch (error) {
    console.error("Error adding course:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const updatePropertyCourse = async (req, res) => {
  try {
    const objectId = req.params.objectId;
    if (!objectId || !mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ error: "Invalid course id (objectId)." });
    }

    // Parse body and JSON-string fields (common when using multipart/form-data)
    const raw = {};
    for (const k of Object.keys(req.body || {})) raw[k] = tryParseJSON(req.body[k]);

    // Accept duration_value + duration_type or direct duration
    if ((raw.duration_value || raw.duration_type) && !raw.duration) {
      const v = (raw.duration_value || "").toString().trim();
      const t = (raw.duration_type || "").toString().trim();
      raw.duration = (v || t) ? `${v} ${t}`.trim() : undefined;
    }

    const {
      course_id,
      course_type,
      course_short_name,
      prices,
      course_level,
      duration,
      certification_type,
      cerification_info,
      best_for,
      languages,
      course_format,
      final_requirement,
      final_key_outcomes,
      status,
      image, // optional incoming images array (if you send it)
    } = raw;

    if (!course_id) return res.status(400).json({ error: "Missing course_id." });

    const existing = await PropertyCourse.findById(objectId);
    if (!existing) return res.status(404).json({ error: "PropertyCourse not found." });

    // We don't need baseCourse for the simple "always update when sent" logic,
    // but we load it only to optionally copy image if needed
    const baseCourse = await Course.findById(course_id).lean();

    const updateData = {};

    // course_id always set (converted to ObjectId)
    updateData.course_id = toObjectIdIfValid(course_id);

    // If frontend sends a non-empty value, set it (overwrite existing)
    if (!isEmptyValue(course_short_name)) updateData.course_short_name = course_short_name;
    if (!isEmptyValue(course_level)) updateData.course_level = course_level;
    if (!isEmptyValue(duration)) updateData.duration = duration;
    if (!isEmptyValue(certification_type)) updateData.certification_type = certification_type;
    // cerification_info may be boolean false - treat false as valid
    if (typeof cerification_info !== "undefined" && cerification_info !== null) {
      if (cerification_info === false || cerification_info === true || !isEmptyValue(cerification_info)) {
        updateData.cerification_info = cerification_info;
      }
    }
    if (!isEmptyValue(course_format)) updateData.course_format = course_format;
    if (!isEmptyValue(status)) updateData.status = status;

    // course_type: convert to ObjectId if possible
    if (typeof course_type !== "undefined" && !isEmptyValue(course_type)) {
      updateData.course_type = toObjectIdIfValid(course_type);
    }

    // best_for: accept array or single value -> convert items to ObjectId if possible
    if (typeof best_for !== "undefined" && !isEmptyValue(best_for)) {
      const arr = Array.isArray(best_for) ? best_for : [best_for];
      updateData.best_for = arr.map((x) => toObjectIdIfValid(x));
    }

    // languages: keep as array of strings (or single)
    if (typeof languages !== "undefined" && !isEmptyValue(languages)) {
      updateData.languages = Array.isArray(languages) ? languages : [languages];
    }

    // requirements / key_outcomes
    if (typeof final_requirement !== "undefined" && !isEmptyValue(final_requirement)) {
      updateData.requirements = Array.isArray(final_requirement) ? final_requirement : [final_requirement];
    }
    if (typeof final_key_outcomes !== "undefined" && !isEmptyValue(final_key_outcomes)) {
      updateData.key_outcomes = Array.isArray(final_key_outcomes) ? final_key_outcomes : [final_key_outcomes];
    }

    // prices: sanitize to numbers, only if non-empty
    if (typeof prices !== "undefined" && !isEmptyValue(prices)) {
      const parsedPrices = (typeof prices === "object") ? prices : tryParseJSON(prices);
      if (!isEmptyValue(parsedPrices)) {
        const sanitized = {};
        Object.entries(parsedPrices).forEach(([k, v]) => {
          const n = Number(v);
          sanitized[k] = Number.isNaN(n) ? v : n;
        });
        updateData.prices = sanitized;
      }
    }

    // image: if incoming image array provided, use it; else if existing image empty and baseCourse has valid images, copy filtered base images
    if (typeof image !== "undefined" && !isEmptyValue(image)) {
      updateData.image = Array.isArray(image) ? image : [image];
    } else {
      // only copy baseCourse.image when property currently has no images
      const existingHasImage = Array.isArray(existing.image) ? existing.image.filter(Boolean).length > 0 : !isEmptyValue(existing.image);
      if (!existingHasImage && baseCourse?.image) {
        // filter out null/empty entries
        const filtered = Array.isArray(baseCourse.image) ? baseCourse.image.filter((x) => x !== null && typeof x !== "undefined" && String(x).trim() !== "") : baseCourse.image;
        if (!isEmptyValue(filtered)) updateData.image = filtered;
      }
    }

    // If nothing to update, return early
    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ message: "No valid fields provided to update." });
    }

    const updated = await PropertyCourse.findByIdAndUpdate(objectId, { $set: updateData }, { new: true });
    return res.status(200).json({ message: "Course updated successfully.", updated });
  } catch (err) {
    console.error("updatePropertyCourse.final error:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

export const deletePropertyCourse = async (req, res) => {
  try {
    const { objectId } = req.params;

    const course = await PropertyCourse.findById(objectId);
    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    const property_id = course.property_id;

    const courseCount = await PropertyCourse.countDocuments({ property_id });

    const delCourse = await PropertyCourse.findOneAndDelete({ _id: objectId });

    if (delCourse) {
      if (courseCount === 1) {
        await addPropertyScore({
          property_score: -10,
          property_id: property_id,
        });
      }

      return res
        .status(200)
        .json({ message: "Property Course Deleted Successfully" });
    } else {
      return res
        .status(404)
        .json({ error: "Course not found during deletion." });
    }
  } catch (error) {
    console.error("Error deleting property course:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
