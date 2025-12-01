import BlogEnquiry from "../models/BlogEnquiry.js";

export const createBlogEnquiry = async (req, res) => {
  try {
    const { name, email, mobile_no, message, blogId } = req.body;

    if (!name || !email || !mobile_no || !message || !blogId) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const lastDoc = await BlogEnquiry.findOne().sort({ uniqueId: -1 }).lean();
    const uniqueId = lastDoc ? lastDoc.uniqueId + 1 : 1;

    const newEnquiry = new BlogEnquiry({
      uniqueId,
      name,
      email,
      mobile_no,
      message,
      blogId,
    });

    await newEnquiry.save();

    res.status(201).json({ message: "Blog enquiry created successfully." });
  } catch (error) {
    console.error("Error creating blog enquiry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
