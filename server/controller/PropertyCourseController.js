import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import Course from "../models/Courses.js";
import PropertyCourse from "../models/PropertyCourse.js";
import { generateUniqueId } from "../utils/Callback.js";

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

    const {
      course_id,
      course_type,
      course_short_name,
      prices,
      course_level,
      duration,
      certification_type,
      final_requirement,
      cerification_info,
      best_for,
      languages,
      course_format,
      final_key_outcomes,
      status,
    } = req.body;

    if (!objectId || !course_id) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Find the existing course
    const existingCourse = await PropertyCourse.findById(objectId);
    if (!existingCourse) {
      return res.status(404).json({ error: "Course not found." });
    }

    // Find the base course
    const baseCourse = await Course.findOne({ _id: course_id });
    if (!baseCourse) {
      return res.status(404).json({ error: "Base course not found." });
    }

    // Define fields to compare
    const propertyCourseFields = [
      "course_type",
      "course_short_name",
      "prices",
      "course_level",
      "duration",
      "certification_type",
      "requirements",
      "best_for",
      "key_outcomes",
      "languages",
      "course_format",
      "cerification_info",
    ];

    // Define expected types for array fields
    const arrayFieldsWithTypes = {
      requirements: "object",
      best_for: "object",
      key_outcomes: "object",
      prices: "object",
      languages: "string",
    };

    // Input data mapping
    const inputData = {
      course_type,
      course_short_name,
      prices,
      course_level,
      duration,
      certification_type,
      requirements: final_requirement,
      best_for,
      key_outcomes: final_key_outcomes,
      languages,
      course_format,
      cerification_info,
    };

    // Helper: compare arrays deeply
    const arraysAreEqual = (a, b) => {
      return JSON.stringify(a) === JSON.stringify(b);
    };

    // Prepare update data
    const updateData = {
      course_id,
    };

    // Compare fields with base course
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
          updateData[field] = inputVal;
        }
      } else {
        if (JSON.stringify(inputVal) !== JSON.stringify(baseVal)) {
          updateData[field] = inputVal;
        }
      }
    }

    // Set image if base course has one
    if (baseCourse.image) {
      updateData.image = baseCourse.image;
    }

    updateData.status = status;

    // Update the course
    const updatedCourse = await PropertyCourse.findByIdAndUpdate(
      objectId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found." });
    }

    return res.status(200).json({
      message: "Course updated successfully.",
      updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({ error: "Internal Server Error." });
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
