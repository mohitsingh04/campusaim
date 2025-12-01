import BlogCategory from "../models/BlogCategory.js";

export const createBlogCategory = async (req, res) => {
  try {
    const { blog_category, parent_category } = req.body;

    const existingCategory = await BlogCategory.findOne({
      blog_category,
      parent_category,
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists under the same parent category",
      });
    }

    const lastCategory = await BlogCategory.findOne().sort({ uniqueId: -1 });
    const uniqueId = lastCategory ? lastCategory.uniqueId + 1 : 1;

    const newCategory = new BlogCategory({
      uniqueId,
      blog_category: blog_category,
      parent_category,
    });

    await newCategory.save();

    return res
      .status(200)
      .json({ message: "Blog Category Created Successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllBlogCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.find();

    if (!categories) {
      return res.status(404).json({ error: "Blog Categories Not Found" });
    }

    return res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const deleteBlogCategory = async (req, res) => {
  try {
    const { objectId } = req.params;

    const isExisting = await BlogCategory.findById(objectId);
    if (!isExisting) {
      return res.status(404).json({ error: "Blog Category Not Found" });
    }

    await BlogCategory.findOneAndDelete({ _id: objectId });

    return res
      .status(200)
      .json({ message: "Blog Category Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const updateBlogCategory = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { blog_category, parent_category, status } = req.body;

    const existingCategory = await BlogCategory.findOne({
      blog_category,
      parent_category,
      _id: { $ne: objectId },
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists under the same parent category",
      });
    }

    const updatedCategory = await BlogCategory.findOneAndUpdate(
      { _id: objectId },
      {
        blog_category,
        parent_category,
        status: status || "updated",
      },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({
      message: "Blog Category Updated Successfully",
      category: updatedCategory,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getBlogCategoryById = async (req, res) => {
  try {
    const { objectId } = req.params;

    const category = await BlogCategory.findById(objectId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
