import { generateSlug, getUploadedFilePaths } from "../utils/Callback.js";
import { downloadImageAndReplaceSrcNonProperty } from "../helper/folder-cleaners/EditorImagesController.js";
import Course from "../models/Courses.js";
import { autoAddAllSeo } from "./AllSeoController.js";
import AllSeo from "../models/AllSeo.js";
import mongoose from "mongoose";

function normalizeBestFor(best_for) {
  let bestForArray = [];

  if (best_for) {
    if (Array.isArray(best_for)) {
      bestForArray = best_for;
    } else if (typeof best_for === "string") {
      try {
        const parsed = JSON.parse(best_for);
        if (Array.isArray(parsed)) bestForArray = parsed;
        else if (typeof parsed === "string" && parsed.trim())
          bestForArray = [parsed];
      } catch (err) {
        if (best_for.includes(",")) {
          bestForArray = best_for
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        } else if (best_for.trim()) {
          bestForArray = [best_for.trim()];
        }
      }
    } else {
      bestForArray = [String(best_for)];
    }
  }

  // Keep strings only and filter invalid ObjectId strings.
  return bestForArray
    .map((id) => String(id).trim())
    .filter((id) => mongoose.Types.ObjectId.isValid(id));
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

export const getCourseByUniqueId = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const course = await Course.findOne({ uniqueId });
    if (!course) {
      return res.status(404).json({ error: "Course not found!" });
    }
    return res.status(200).json(course);
  } catch (error) {
    console.error(error);
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
      program_type,
      course_eligibility,
      description,
      best_for,
    } = req.body;

    if (!course_name) {
      return res.status(400).json({ error: "Course name is required." });
    }

    const bestForArray = normalizeBestFor(best_for);
    const courseTypeArray = normalizeToStringArray(course_type);
    const programTypeArray = normalizeToStringArray(program_type);

    const images = await getUploadedFilePaths(req, "image");

    const courseSlug = await generateSlug(course_name);

    const existCourse = await Course.findOne({ course_name });
    if (existCourse) {
      return res.status(400).json({ error: "This course already exists." });
    }

    let updatedDescription = description;
    if (description) {
      updatedDescription = await downloadImageAndReplaceSrcNonProperty(description, "course");
    }

    const newCourse = new Course({
      userId,
      course_name,
      course_short_name,
      specialization,
      duration,
      course_type,
      program_type,
      best_for: bestForArray,
      course_type: courseTypeArray,
      program_type: programTypeArray,
      course_eligibility,
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
      program_type,
      course_eligibility,
      duration,
      description,
      best_for,
      status,
    } = req.body;

    // Normalize fields
    const normalizedBestFor = normalizeBestFor(best_for);
    const normalizedCourseType = normalizeToStringArray(course_type);
    const normalizedProgramType = normalizeToStringArray(program_type);

    let updatedDescription = description;
    if (description) {
      updatedDescription = await downloadImageAndReplaceSrcNonProperty(
        description,
        "course"
      );
    }

    const imageFile = req.files?.["image"];
    const existImage = imageFile
      ? imageFile[0]?.webpFilename
      : course.image?.[0];
    const existImageOriginal = imageFile
      ? imageFile[0]?.filename
      : course.image?.[1];

    const updateObj = {
      course_name,
      course_short_name,
      specialization,
      course_eligibility,
      image: [existImage, existImageOriginal],
      duration,
      description: updatedDescription,
      status,
    };

    if (best_for !== undefined) {
      updateObj.best_for = normalizedBestFor;
    }

    if (course_type !== undefined) {
      updateObj.course_type = normalizedCourseType;
    }

    if (program_type !== undefined) {
      updateObj.program_type = normalizedProgramType;
    }

    const courseUpdated = await Course.findByIdAndUpdate(
      objectId,
      { $set: updateObj },
      { new: true }
    );

    autoAddAllSeo({
      type_id: courseUpdated._id,
      title: course_name,
      description: updatedDescription,
      slug: generateSlug(course_name),
      type: "course",
    });

    return res.status(200).json({ message: "Course updated successfully." });
  } catch (error) {
    console.error(error);
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

    return res.status(200).json({ message: "Course is Softly Deleted" });
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

    return res.status(200).json({ message: "Course is Softly Deleted" });
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
