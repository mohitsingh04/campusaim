import BlogTags from "../models/BlogTags.js";

export const CreateTagController = async (req, res) => {
  try {
    const { blog_tag } = req.body;

    const existingTag = await BlogTags.findOne({ blog_tag });

    if (existingTag) {
      return res.status(400).json({ error: "Tag already exists." });
    }

    const lastDoc = await BlogTags.findOne().sort({ uniqueId: -1 });
    const uniqueId = lastDoc ? lastDoc?.uniqueId + 1 : 1;

    const newTag = new BlogTags({
      uniqueId,
      blog_tag,
    });

    await newTag.save();

    return res.status(201).json({ message: "Tag created successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllBlogTags = async (req, res) => {
  try {
    const tags = await BlogTags.find();

    if (!tags) {
      return res.status(404).json({ error: "Tags Not Found" });
    }

    return res.status(200).json(tags);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getBlogTagById = async (req, res) => {
  try {
    const { objectId } = req.params;
    const tags = await BlogTags.findById(objectId);

    if (!tags) {
      return res.status(404).json({ error: "Tags Not Found" });
    }

    return res.status(200).json(tags);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
// ✅ Update Blog Tag
export const updateBlogTag = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { blog_tag } = req.body; // expecting "tag" from frontend

    const tags = await BlogTags.findById(objectId);

    if (!tags) {
      return res.status(404).json({ error: "Tag Not Found" });
    }

    tags.blog_tag = blog_tag || tags.blog_tag;

    await tags.save();

    return res.status(200).json({
      message: "Tag Updated Successfully",
      data: tags,
    });
  } catch (error) {
    console.error("Update Blog Tag Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
