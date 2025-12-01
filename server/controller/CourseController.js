import { generateSlug, getUploadedFilePaths } from "../utils/Callback.js";
import { downloadImageAndReplaceSrcNonProperty } from "../helper/folder-cleaners/EditorImagesController.js";
import Course from "../models/Courses.js";
import { autoAddAllSeo } from "./AllSeoController.js";
import AllSeo from "../models/AllSeo.js";

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
      stream,
      duration,
      description,
      status,
      certification_type,
    } = req.body;

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

    const courseUpdated = await Course.findByIdAndUpdate(
      objectId,
      {
        $set: {
          course_name,
          course_short_name,
          specialization,
          stream,
          image: [existImage, existImageOriginal],
          duration,
          description: updatedDescription,
          status,
          certification_type,
        },
      },
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

export const addCourse = async (req, res) => {
  try {
    const {
      userId,
      course_name,
      course_short_name,
      specialization,
      stream,
      duration,
      description,
      certification_type,
    } = req.body;

    const images = await getUploadedFilePaths(req, "image");

    const courseSlug = await generateSlug(course_name);

    const existCourse = await Course.findOne({ course_name });

    if (existCourse) {
      return res.status(400).json({ error: "This course already exists." });
    }

    const lastCourse = await Course.findOne().sort({ _id: -1 }).limit(1);
    const uniqueId = lastCourse ? lastCourse.uniqueId + 1 : 1;

    let updatedDescription = description;
    if (description) {
      updatedDescription = await downloadImageAndReplaceSrcNonProperty(
        description,
        "course"
      );
    }

    const newCourse = new Course({
      userId,
      uniqueId,
      course_name,
      course_short_name,
      specialization,
      stream,
      image: images,
      duration,
      description: updatedDescription,
      course_slug: courseSlug,
      certification_type,
    });

    const courseCreated = await newCourse.save();
    autoAddAllSeo({
      type_id: courseCreated._id,
      title: course_name,
      description: updatedDescription,
      slug: generateSlug(course_name),
      type: "course",
    });

    return res.status(201).json({ message: "Course added successfully." });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error!" });
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
