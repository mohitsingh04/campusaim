import { getUploadedFilePaths } from "../utils/Callback.js";
import { downloadImageAndReplaceSrcNonProperty } from "../helper/folder-cleaners/EditorImagesController.js";
import Course from "../models/Courses.js";
import { autoAddAllSeo } from "./AllSeoController.js";
import AllSeo from "../models/AllSeo.js";
import mongoose from "mongoose";
import Category from "../models/Category.js";

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

export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const getCourse = async (req, res) => {
  try {
    const courses = await Course.find();
    return res.status(200).json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error!" });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { objectId } = req.params;
    const course = await Course.findById(objectId);
    if (!course) {
      return res.status(404).json({ error: "Course not found!" });
    }
    return res.status(200).json(course);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

export const getCourseByObjectId = async (req, res) => {
  try {
    const { objectId } = req.params;

    if (!objectId || !mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ error: "Invalid Course ID." });
    }

    const course = await Course.findById(objectId);

    if (!course) {
      return res.status(404).json({ error: "Course not found!" });
    }

    return res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

export const addCourse = async (req, res) => {
  try {
    let {
      userId,
      course_name,
      course_short_name,
      specialization,
      duration,
      course_type,
      degree_type,
      program_type,
      description,
      best_for,
      course_eligibility,
    } = req.body;
    
    if (!course_name) {
      return res.status(400).json({ error: "Course name is required." });
    }

    const bestForArray = normalizeObjectIdArray(best_for);
    const specializationArray = normalizeObjectIdArray(specialization);
    const courseEligibilityArray = normalizeObjectIdArray(course_eligibility);
    const courseTypeArray = normalizeToStringArray(course_type);
    const degreeTypeArray = normalizeToStringArray(degree_type);
    const programTypeArray = normalizeToStringArray(program_type);

    const images = await getUploadedFilePaths(req, "image");

    const courseSlug = generateSlug(course_name);

    const existCourse = await Course.findOne({ course_name });
    if (existCourse) {
      return res.status(400).json({ error: "This course is already exists." });
    }

    let updatedDescription = description;
    if (description) {
      updatedDescription = await downloadImageAndReplaceSrcNonProperty(description, "course");
    }

    const newCourse = new Course({
      userId,
      course_name,
      course_short_name,
      duration,
      program_type,
      best_for: bestForArray,
      specialization: specializationArray,
      course_type: courseTypeArray,
      degree_type: degreeTypeArray,
      program_type: programTypeArray,
      course_eligibility: courseEligibilityArray,
      description: updatedDescription,
      image: images,
      course_slug: courseSlug,
    });
    
    const courseCreated = await newCourse.save();

    try {
      await autoAddAllSeo({
        type_id: courseCreated._id,
        title: course_name,
        description: updatedDescription,
        slug: courseSlug,
        type: "course",
      });
    } catch (seoErr) {
      console.warn("autoAddAllSeo failed:", seoErr?.message || seoErr);
    }

    return res.status(201).json({
      message: "Course added successfully.",
      course: courseCreated,
    });
  } catch (err) {
    console.error("addCourse error:", err);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { objectId } = req.params;

    const course = await Course.findById(objectId);
    if (!course) {
      return res.status(404).json({ error: "Course not found!" });
    }

    const {
      course_name,
      course_short_name,
      specialization,
      course_type,
      degree_type,
      program_type,
      course_eligibility,
      duration,
      description,
      best_for,
      status,
    } = req.body;

    const courseSlug = generateSlug(course_name);

    // Normalize inputs (ONLY when provided)
    const normalizedBestFor =
      best_for !== undefined ? normalizeObjectIdArray(best_for) : undefined;

    const normalizedCourseEligibility =
      course_eligibility !== undefined ? normalizeObjectIdArray(course_eligibility) : undefined;

      const normalizedSpecialization =
      specialization !== undefined ? normalizeObjectIdArray(specialization) : undefined;

    const normalizedCourseType =
      course_type !== undefined
        ? normalizeToStringArray(course_type)
        : undefined;

    const normalizedDegreeType =
      degree_type !== undefined
        ? normalizeToStringArray(degree_type)
        : undefined;

    const normalizedProgramType =
      program_type !== undefined
        ? normalizeToStringArray(program_type)
        : undefined;

    // Sanitize description
    let updatedDescription = description;
    if (description) {
      updatedDescription = await downloadImageAndReplaceSrcNonProperty(
        description,
        "course"
      );
    }

    // Handle image safely
    const imageFile = req.files?.["image"];
    const existImage = imageFile
      ? imageFile[0]?.webpFilename
      : course.image?.[0];

    const existImageOriginal = imageFile
      ? imageFile[0]?.filename
      : course.image?.[1];

    // Base update object (NO accidental overwrites)
    const updateObj = {
      ...(course_name && { course_name }),
      ...(course_short_name && { course_short_name }),
      ...(duration && { duration }),
      ...(updatedDescription && { description: updatedDescription }),
      ...(status !== undefined && { status }),
      ...(courseSlug && { course_slug: courseSlug }),
      image: [existImage, existImageOriginal],
    };

    // Conditional updates
    if (normalizedBestFor) {
      updateObj.best_for = normalizedBestFor;
    }

    if (normalizedCourseEligibility) {
      updateObj.course_eligibility = normalizedCourseEligibility;
    }

    if (normalizedSpecialization) {
      updateObj.specialization = normalizedSpecialization;
    }

    if (normalizedCourseType) {
      updateObj.course_type = normalizedCourseType;
    }

    if (normalizedDegreeType) {
      updateObj.degree_type = normalizedDegreeType;
    }

    if (normalizedProgramType) {
      updateObj.program_type = normalizedProgramType;
    }

    const courseUpdated = await Course.findByIdAndUpdate(
      objectId,
      { $set: updateObj },
      { new: true }
    );

    // SEO update (non-blocking)
    autoAddAllSeo({
      type_id: courseUpdated._id,
      title: courseUpdated.course_name,
      description: updatedDescription,
      slug: courseUpdated.course_slug,
      type: "course",
    });

    return res.status(200).json({
      message: "Course updated successfully.",
      course: courseUpdated,
    });
  } catch (error) {
    console.error("updateCourse error:", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { objectId } = req.params;

    const course = await Course.findById(objectId);
    if (!course) {
      return res.status(404).json({ error: "Course not found!" });
    }

    await Course.findByIdAndDelete(objectId);
    return res.status(200).json({ message: "Course deleted successfully." });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const softDeleteCourse = async (req, res) => {
  try {
    const { objectId } = req.params;
    const course = await Course.findById(objectId);
    if (!course) {
      return res.status(404).json({ error: "Course not found!" });
    }

    await Course.findOneAndUpdate(
      { _id: objectId },
      { $set: { isDeleted: true, status: "Suspended" } }
    );

    return res.status(200).json({ message: "Moved to Archives Courses." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const restoreCourse = async (req, res) => {
  try {
    const { objectId } = req.params;
    const course = await Course.findById(objectId);
    if (!course) {
      return res.status(404).json({ error: "Course not found!" });
    }

    await Course.findOneAndUpdate(
      { _id: objectId },
      { $set: { isDeleted: false, status: "Active" } }
    );

    return res.status(200).json({ message: "Course is Recover successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCourseWithSeoBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // 1️⃣ Try finding SEO data first
    let seoData = await AllSeo.findOne({ slug, type: "course" });
    let course;

    if (seoData) {
      // If SEO exists → fetch blog by ID
      course = await Course.findOne({ _id: seoData.course_id });
    } else {
      const allcourse = await Course.find();
      course = allcourse.find(
        (item) => generateSlug(item.course_name) === slug
      );
    }

    if (!course) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Return only blog if SEO is missing
    const finalCourse = seoData
      ? { ...course.toObject(), seo: seoData }
      : course.toObject();

    return res.status(200).json(finalCourse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
