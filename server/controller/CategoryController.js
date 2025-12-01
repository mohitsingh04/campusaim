import {
  generateSlug,
  generateUniqueId,
  getUploadedFilePaths,
} from "../utils/Callback.js";
import { downloadImageAndReplaceSrcNonProperty } from "../helper/folder-cleaners/EditorImagesController.js";
import Category from "../models/Category.js";
import RegularUser from "../profile-model/RegularUser.js";
import { getDataFromToken } from "../utils/getDataFromToken.js";
import Follow from "../ask_model/Follow.js";

export const getCategory = async (req, res) => {
  try {
    const categories = await Category.find().sort({ category_name: 1 });
    return res.status(200).json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { objectId } = req.params;

    if (!objectId) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    const category = await Category.findById(objectId);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(200).json(category);
  } catch (err) {
    console.error("Error fetching category by ID:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { userId, category_name, parent_category, description } = req.body;

    if (!userId || !category_name) {
      return res
        .status(400)
        .json({ error: "User ID and Category Name are required" });
    }

    const featuredImages = await getUploadedFilePaths(req, "featured_image");
    const logoImages = await getUploadedFilePaths(req, "category_icon");

    const existCategory = await Category.findOne({
      category_name,
      parent_category: parent_category || null,
    });

    if (existCategory) {
      return res.status(400).json({ error: "This category already exists." });
    }

    const uniqueId = await generateUniqueId(Category);

    let updatedDescription = description;
    if (description) {
      updatedDescription = await downloadImageAndReplaceSrcNonProperty(
        description,
        "category"
      );
    }

    const generatedSlug = generateSlug(category_name);

    const newCategory = new Category({
      uniqueId,
      userId,
      category_name,
      parent_category,
      slug: generatedSlug,
      category_icon: logoImages,
      featured_image: featuredImages,
      description: updatedDescription,
    });

    await newCategory.save();

    return res.status(201).json({ message: "Category added successfully." });
  } catch (err) {
    console.error("Error adding category:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { objectId } = req.params;

    if (!objectId) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    const category = await Category.findById(objectId);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    await Category.findByIdAndDelete(objectId);

    return res.status(200).json({ message: "Category deleted successfully." });
  } catch (err) {
    console.error("Error deleting category:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { userId, category_name, parent_category, description, status } =
      req.body;

    const category = await Category.findById(objectId);
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }

    // ✅ Check for duplicate category name under the same parent only
    const existingCategory = await Category.findOne({
      category_name,
      parent_category: parent_category || null,
      _id: { $ne: objectId }, // exclude current category
    });

    if (existingCategory) {
      return res.status(400).json({
        error: "Category name already exists under the same parent category.",
      });
    }

    // Handle updated images (keep old ones if not changed)
    const category_icon =
      req.files?.category_icon?.[0]?.webpFilename ||
      category.category_icon?.[0];
    const category_original_icon =
      req.files?.category_icon?.[0]?.filename || category.category_icon?.[1];

    const featured_image =
      req.files?.featured_image?.[0]?.webpFilename ||
      category.featured_image?.[0];
    const featured_original_image =
      req.files?.featured_image?.[0]?.filename || category.featured_image?.[1];

    // Process description images if provided
    let updatedDescription = description;
    if (description) {
      updatedDescription = await downloadImageAndReplaceSrcNonProperty(
        description,
        "category"
      );
    }

    const generatedSlug = generateSlug(category_name);

    await Category.findByIdAndUpdate(
      objectId,
      {
        userId,
        category_name,
        parent_category: parent_category,
        slug: generatedSlug,
        category_icon: [category_icon, category_original_icon],
        featured_image: [featured_image, featured_original_image],
        description: updatedDescription,
        status,
      },
      { new: true }
    );

    return res.status(200).json({ message: "Category updated successfully." });
  } catch (err) {
    console.error("Error updating category:", err);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

// 👉 Follow a category
export const followCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const currentUserId = await getDataFromToken(req);

    const category = await Category.findById(categoryId);
    const currentUser = await RegularUser.findById(currentUserId);

    if (!category || !currentUser) {
      return res.status(404).json({ error: "Category or User not found" });
    }

    // Check if already following
    const alreadyFollowing = await Follow.findOne({
      follower: currentUserId,
      followingType: "Category",
      following: categoryId,
    });

    if (alreadyFollowing) {
      return res.status(400).json({ error: "Already following this category" });
    }

    await Follow.create({
      follower: currentUserId,
      followingType: "Category",
      following: categoryId,
    });

    return res.status(200).json({ message: "Category followed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Unfollow a category
export const unfollowCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const currentUserId = await getDataFromToken(req);

    const category = await Category.findById(categoryId);
    const currentUser = await RegularUser.findById(currentUserId);

    if (!category || !currentUser) {
      return res.status(404).json({ error: "Category or User not found" });
    }

    const result = await Follow.findOneAndDelete({
      follower: currentUserId,
      followingType: "Category",
      following: categoryId,
    });

    if (!result) {
      return res
        .status(400)
        .json({ error: "You are not following this category" });
    }

    res.json({ message: "Category unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get category followers
export const getCategoryFollowers = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Find all follows where followingType is Category and following is this category
    const follows = await Follow.find({
      followingType: "Category",
      following: categoryId,
    });

    const followerIds = follows.map((f) => f.follower);

    // Fetch user info for all follower IDs
    const users = await RegularUser.find(
      { _id: { $in: followerIds } },
      "name username avatar"
    );

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get categories a user is following
export const getFollowedCategories = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find all follows where follower is this user and followingType is Category
    const follows = await Follow.find({
      follower: userId,
      followingType: "Category",
    });

    const categoryIds = follows.map((f) => f.following);

    // Fetch category info for all category IDs
    const categories = await Category.find(
      { _id: { $in: categoryIds } },
      "category_name description"
    );

    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ error: "Category slug is required" });
    }

    const category = await Category.findOne({ slug }).lean();

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Fetch followers for this category
    const follows = await Follow.find({
      followingType: "Category",
      following: category._id,
    });

    const followerIds = follows.map((f) => f.follower);

    // Fetch user info for all follower IDs
    const followers = await RegularUser.find(
      { _id: { $in: followerIds } },
      "name username avatar"
    ).lean();

    // Attach followers to the category object
    category.followers = followers;

    return res.status(200).json(category);
  } catch (err) {
    console.error("Error fetching category by slug:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};