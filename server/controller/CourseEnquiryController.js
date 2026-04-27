import CourseEnquiry from "../models/CourseEnquiry.js";
import { generateUniqueId } from "../utils/Callback.js";

export const createCourseEnquiry = async (req, res) => {
  try {
    const { name, email, mobile_no, message, courseId, examId } = req.body;

    // Basic validation
    if (!name || !email || !mobile_no || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Enforce ONLY ONE: either courseId OR examId
    if ((!courseId && !examId) || (courseId && examId)) {
      return res.status(400).json({
        error: "Provide either courseId OR examId, not both.",
      });
    }

    const uniqueId = await generateUniqueId(CourseEnquiry);

    // Prepare payload dynamically
    const enquiryData = {
      uniqueId,
      name,
      email,
      mobile_no,
      message,
    };

    if (courseId) {
      enquiryData.courseId = courseId;
    }

    if (examId) {
      enquiryData.examId = examId;
    }

    const newEnquiry = new CourseEnquiry(enquiryData);

    await newEnquiry.save();

    res.status(201).json({
      message: "Enquiry created successfully.",
      data: newEnquiry,
    });
  } catch (error) {
    console.error("Error creating Course enquiry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};