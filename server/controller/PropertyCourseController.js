import mongoose from "mongoose";
import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import Course from "../models/Courses.js";
import PropertyCourse from "../models/PropertyCourse.js";
import { generateUniqueId } from "../utils/Callback.js";

function normalizeObjectIdArray(input) {
  let arr = [];

  if (!input) return arr;

  if (Array.isArray(input)) {
    arr = input;
  } else if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) arr = parsed;
      else if (parsed) arr = [parsed];
    } catch {
      arr = input.includes(",")
        ? input.split(",").map(s => s.trim())
        : [input.trim()];
    }
  } else {
    arr = [String(input)];
  }

  return arr
    .map(id => String(id).trim())
    .filter(id => mongoose.Types.ObjectId.isValid(id));
}


function normalizeToStringArray(value) {
  let arr = [];

  if (value) {
    if (Array.isArray(value)) {
      arr = value;
    } else if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) arr = parsed.map((v) => String(v));
        else if (typeof parsed === "string" && parsed.trim())
          arr = [parsed];
      } catch (err) {
        if (value.includes(",")) {
          arr = value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        } else if (value.trim()) {
          arr = [value.trim()];
        }
      }
    } else {
      arr = [String(value)];
    }
  }

  return arr.map((v) => String(v).trim()).filter(Boolean);
}

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
    const { propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: "Invalid Property ID" });
    }

    const propertyCourse = await PropertyCourse.find({
      property_id: new mongoose.Types.ObjectId(propertyId),
    });

    return res.status(200).json(propertyCourse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addPropertyCourse = async (req, res) => {
  try {
    const {
      userId,
      course_id,
      property_id,
      course_short_name,
      course_type,
      degree_type,
      program_type,
      duration,
      best_for = [],
      course_eligibility = [],
      specialization_fees = [],
    } = req.body;

    /* ------------------------ BASIC VALIDATION ------------------------ */

    if (!userId || !course_id || !property_id) {
      return res.status(400).json({
        error: "userId, course_id and property_id are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(course_id) ||
      !mongoose.Types.ObjectId.isValid(property_id)
    ) {
      return res.status(400).json({ error: "Invalid ObjectId provided" });
    }

    /* -------------------- PREVENT DUPLICATE COURSE -------------------- */

    const exists = await PropertyCourse.findOne({
      course_id,
      property_id,
      isDeleted: false,
    });

    if (exists) {
      return res.status(409).json({
        error: "This course already exists for this property",
      });
    }

    /* ------------------- ENSURE MASTER COURSE EXISTS ------------------ */

    const masterCourse = await Course.findById(course_id).lean();
    if (!masterCourse) {
      return res.status(404).json({
        error: "Course not found in master Course collection",
      });
    }

    /* ---------------- SPECIALIZATION BUSINESS RULE -------------------- */

    if (!Array.isArray(specialization_fees)) {
      return res.status(400).json({
        error: "specialization_fees must be an array",
      });
    }

    let sanitizedSpecializationFees = [];

    const hasSpecialization =
      Array.isArray(masterCourse.specialization) &&
      masterCourse.specialization.length > 0;

    if (hasSpecialization) {
      if (specialization_fees.length === 0) {
        return res.status(400).json({
          error: "Specialization is required for this course",
        });
      }

      sanitizedSpecializationFees = specialization_fees.map((item, idx) => {
        const { specialization_id, fees } = item || {};

        if (!mongoose.Types.ObjectId.isValid(specialization_id)) {
          throw new Error(`Invalid specialization_id at index ${idx}`);
        }

        if (!fees || typeof fees !== "object") {
          throw new Error(`Fees missing for specialization at index ${idx}`);
        }

        return {
          specialization_id: new mongoose.Types.ObjectId(specialization_id),
          fees: {
            tuition_fee: Number(fees.tuition_fee || 0),
            registration_fee: Number(fees.registration_fee || 0),
            exam_fee: Number(fees.exam_fee || 0),
            currency: String(fees.currency || "INR").toUpperCase(),
          },
        };
      });

      // 🚫 DUPLICATE SPECIALIZATION GUARD (MANDATORY)
      const ids = sanitizedSpecializationFees.map(s => String(s.specialization_id));
      if (new Set(ids).size !== ids.length) {
        return res.status(400).json({
          error: "Duplicate specialization detected",
        });
      }
    }

    /* -------------------- CREATE PROPERTY COURSE ---------------------- */

    const uniqueId = await generateUniqueId(PropertyCourse);

    const propertyCourse = new PropertyCourse({
      userId,
      uniqueId,
      course_id,
      property_id,
      course_short_name: course_short_name || masterCourse.course_short_name,
      course_type,
      degree_type,
      program_type,
      duration,
      best_for,
      course_eligibility,
      specialization_fees: sanitizedSpecializationFees,
    });

    await propertyCourse.save();

    return res.status(201).json({
      message: "Property course added successfully",
      data: propertyCourse,
    });
  } catch (error) {
    console.error("addPropertyCourse error:", error);
    return res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
};

export const updatePropertyCourse = async (req, res) => {
  try {
    const { objectId } = req.params;

    if (!objectId || !mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ error: "Invalid property course id." });
    }

    const raw = {};
    for (const key of Object.keys(req.body || {})) {
      raw[key] = tryParseJSON(req.body[key]);
    }

    const {
      course_short_name,
      course_type,
      degree_type,
      program_type,
      best_for,
      course_eligibility,
      status,
      duration,
      specialization_fees,
    } = raw;

    const existing = await PropertyCourse.findById(objectId);
    if (!existing) {
      return res.status(404).json({ error: "Property course not found." });
    }

    const masterCourse = await Course.findById(existing.course_id).lean();
    if (!masterCourse) {
      return res.status(404).json({ error: "Master course not found." });
    }

    const hasSpecialization =
      Array.isArray(masterCourse.specialization) &&
      masterCourse.specialization.length > 0;

    const updateData = {};

    if (!isEmptyValue(course_short_name)) {
      updateData.course_short_name = course_short_name;
    }

    if (!isEmptyValue(status)) {
      updateData.status = status;
    }

    if (!isEmptyValue(duration)) {
      updateData.duration = duration;
    }

    if (!isEmptyValue(course_type)) {
      updateData.course_type = toObjectIdIfValid(course_type);
    }

    if (!isEmptyValue(degree_type)) {
      updateData.degree_type = toObjectIdIfValid(degree_type);
    }

    if (!isEmptyValue(program_type)) {
      updateData.program_type = toObjectIdIfValid(program_type);
    }

    if (Array.isArray(best_for)) {
      updateData.best_for = best_for
        .map(toObjectIdIfValid)
        .filter((id) => mongoose.Types.ObjectId.isValid(String(id)));
    }

    if (Array.isArray(course_eligibility)) {
      updateData.course_eligibility = course_eligibility
        .map(toObjectIdIfValid)
        .filter((id) => mongoose.Types.ObjectId.isValid(String(id)));
    }

    if (!hasSpecialization) {
      updateData.specialization_fees = [];
    }

    if (hasSpecialization) {
      if (Array.isArray(specialization_fees) && specialization_fees.length === 0) {
        return res.status(400).json({
          error: "Specialization is required for this course",
        });
      }

      if (Array.isArray(specialization_fees)) {
        const sanitized = specialization_fees
          .filter((s) => s?.specialization_id)
          .map((s, idx) => {
            if (!mongoose.Types.ObjectId.isValid(s.specialization_id)) {
              throw new Error(`Invalid specialization_id at index ${idx}`);
            }

            return {
              specialization_id: new mongoose.Types.ObjectId(s.specialization_id),
              fees: {
                tuition_fee: Number(s?.fees?.tuition_fee || 0),
                registration_fee: Number(s?.fees?.registration_fee || 0),
                exam_fee: Number(s?.fees?.exam_fee || 0),
                currency: String(s?.fees?.currency || "INR").toUpperCase(),
              },
            };
          });

        const ids = sanitized.map((s) => String(s.specialization_id));
        if (new Set(ids).size !== ids.length) {
          return res.status(400).json({
            error: "Duplicate specialization detected",
          });
        }

        updateData.specialization_fees = sanitized;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({
        message: "No valid fields provided to update.",
      });
    }

    const updated = await PropertyCourse.findByIdAndUpdate(
      objectId,
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      message: "Course updated successfully.",
      updated,
    });
  } catch (err) {
    console.error("updatePropertyCourse error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
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

export const getPropertyCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const allCourses = await Course.find({});

    const course = allCourses.find(
      (c) => generateSlug(c.course_name) === generateSlug(slug)
    );

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const propertyCourse = await PropertyCourse.findOne({
      course_id: course._id,
    });

    const merged =
      propertyCourse != null
        ? {
          ...course.toObject(),
          ...propertyCourse.toObject(),
          course_id: course._id, // keep original
        }
        : course.toObject();

    const findingCatgories = [
      merged?.course_type,
      merged?.course_format,
      merged?.certification_type,
      merged?.course_level,
    ];

    const keyOutComes = await KeyOutComes.find({ _id: merged.key_outcomes });
    const requirements = await Requirments.find({ _id: merged.requirements });
    const categories = await Category.find({ _id: findingCatgories });

    const finalData = {
      ...merged,
      requirements: requirements.map((item) => item.requirment),
      key_outcomes: keyOutComes.map((item) => item.key_outcome),
      course_type: categories.find((item) => item?._id?.toString() === merged.course_type?.toString())
        ?.category_name,
      certification_type: categories.find(
        (item) => item?._id?.toString() === merged.certification_type?.toString()
      )?.category_name,
      course_level: categories.find((item) => item?._id?.toString() === merged.course_level?.toString())
        ?.category_name,
      course_format: categories.find(
        (item) => item?._id?.toString() === merged.course_format?.toString()
      )?.category_name,
    };

    return res.json(finalData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};