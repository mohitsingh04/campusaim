import CourseEnquiry from "../models/CourseEnquiry.js";
import { generateUniqueId } from "../utils/Callback.js";

export const createCourseEnquiry = async (req, res) => {
  try {
    const { name, email, mobile_no, message, courseId } = req.body;

    if (!name || !email || !mobile_no || !message || !courseId) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const uniqueId = await generateUniqueId(CourseEnquiry);

    const newEnquiry = new CourseEnquiry({
      uniqueId,
      name,
      email,
      mobile_no,
      message,
      courseId,
    });

    await newEnquiry.save();

    res.status(201).json({ message: "Course enquiry created successfully." });
  } catch (error) {
    console.error("Error creating Course enquiry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
