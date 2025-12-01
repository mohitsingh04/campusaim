import {
  generateSlug,
  generateUniqueId,
  getUploadedFilePaths,
} from "../utils/Callback.js";
import { downloadImageAndReplaceSrcNonProperty } from "../helper/folder-cleaners/EditorImagesController.js";
import Blog from "../models/Blog.js";
import { getUserDataFromToken } from "../utils/getDataFromToken.js";
import { autoAddAllSeo } from "./AllSeoController.js";
import AllSeo from "../models/AllSeo.js";

export const CreateBlog = async (req, res) => {
  try {
    const { title, category, tags, blog } = req.body;

    if (!title || !blog) {
      return res.status(400).json({ error: "All Fields are Required" });
    }

    const author = await getUserDataFromToken(req);
    const featuredImages = await getUploadedFilePaths(req, "featured_image");

    const existingBlog = await Blog.findOne({ title });
    if (existingBlog) {
      return res
        .status(400)
        .json({ message: "Title already exists for another blog" });
    }

    const uniqueId = await generateUniqueId(Blog);

    let updatedDescription = blog;
    if (blog) {
      updatedDescription = await downloadImageAndReplaceSrcNonProperty(
        blog,
        "blogs"
      );
    }

    const newBlog = Blog({
      uniqueId,
      title,
      author: author?.uniqueId,
      category: category ? JSON.parse(category) : [],
      tags: tags ? JSON.parse(tags) : [],
      blog: updatedDescription,
    });

    if (featuredImages) {
      newBlog.featured_image = featuredImages;
    }
    const blogCreated = await newBlog.save();

    autoAddAllSeo({
      type_id: blogCreated._id,
      title,
      description: updatedDescription,
      slug: generateSlug(title),
      type: "blog",
    });

    return res.status(200).json({ message: "Blog Created Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const UpdateBlog = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { title, author, status, category, tags, blog } = req.body;

    const blogToUpdate = await Blog.findById(objectId);
    if (!blogToUpdate) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const existingBlog = await Blog.findOne({ title, _id: { $ne: objectId } });
    if (existingBlog) {
      return res
        .status(400)
        .json({ message: "Title already exists for another blog" });
    }

    const featuredImages = await getUploadedFilePaths(req, "featured_image");

    let updatedDescription = blog;
    if (blog) {
      updatedDescription = await downloadImageAndReplaceSrcNonProperty(
        blog,
        "blogs"
      );
    }

    blogToUpdate.title = title || blogToUpdate.title;
    blogToUpdate.author = author || blogToUpdate.author;
    blogToUpdate.status = status || blogToUpdate.status;
    blogToUpdate.category = category
      ? JSON.parse(category)
      : blogToUpdate.category;
    blogToUpdate.tags = tags ? JSON.parse(tags) : blogToUpdate.tags;
    blogToUpdate.blog = updatedDescription || blogToUpdate.blog;

    if (featuredImages && featuredImages[0] && featuredImages[1]) {
      blogToUpdate.featured_image = featuredImages;
    }

    await blogToUpdate.save();

    autoAddAllSeo({
      type_id: blogToUpdate._id,
      title,
      description: updatedDescription,
      slug: generateSlug(title),
      type: "blog",
    });

    return res.status(200).json({ message: "Blog Updated Successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ uniqueId: -1 });

    if (!blogs) {
      return res.status(404).json({ error: "Blog Not Found" });
    }

    return res.status(200).json(blogs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getBlogWithSeoBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // 1️⃣ Try finding SEO data first
    let seoData = await AllSeo.findOne({ slug, type: "blog" });
    let blog;

    if (seoData) {
      // If SEO exists → fetch blog by ID
      blog = await Blog.findOne({ _id: seoData.blog_id });
    } else {
      // SEO not found → fallback by slugified title
      const allBlogs = await Blog.find();
      blog = allBlogs.find((item) => generateSlug(item.title) === slug);
    }

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Return only blog if SEO is missing
    const finalBlog = seoData
      ? { ...blog.toObject(), seo: seoData }
      : blog.toObject();

    return res.status(200).json(finalBlog);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { objectId } = req.params;

    const blogs = await Blog.findOne({ _id: objectId }).sort({ uniqueId: -1 });

    if (!blogs) {
      return res.status(404).json({ error: "Blog Not Found" });
    }

    return res.status(200).json(blogs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const getBlogByUniqueId = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    const blogs = await Blog.findOne({ uniqueId: uniqueId }).sort({
      uniqueId: -1,
    });
    if (!blogs) {
      return res.status(404).json({ error: "Blog Not Found" });
    }

    return res.status(200).json(blogs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { objectId } = req.params;

    const isExisting = await Blog.findById(objectId);
    if (!isExisting) {
      return res.status(404).json({ error: "Blog Not Existing" });
    }

    await Blog.findOneAndDelete({ _id: objectId });
    return res.status(200).json({ message: "Blog Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
