import {
  generateSlug,
  generateUniqueId,
  getUploadedFilePaths,
} from "../utils/Callback.js";
import { downloadImageAndReplaceSrcNonProperty } from "../helper/folder-cleaners/EditorImagesController.js";
import NewsAndUpdates from "../models/NewsAndUpdates.js";
import RegularUser from "../profile-model/RegularUser.js";
import { getDataFromToken } from "../utils/getDataFromToken.js";
import { autoAddAllSeo } from "./AllSeoController.js";
import AllSeo from "../models/AllSeo.js";

export const createNewsAndUpdates = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Get user info from token
    const user = await getDataFromToken(req);

    const featuredImages = await getUploadedFilePaths(req, "featured_image");
    const uniqueId = await generateUniqueId(NewsAndUpdates);

    let updatedContent = content;
    if (content) {
      updatedContent = await downloadImageAndReplaceSrcNonProperty(
        content,
        "news-and-updates"
      );
    }

    const news = await NewsAndUpdates({
      uniqueId,
      title,
      content: updatedContent,
      author: user,
      featured_image: featuredImages,
      status: "Drafted",
    });

    const createdNews = await news.save();

    autoAddAllSeo({
      type_id: createdNews._id,
      title: title,
      description: updatedContent,
      slug: generateSlug(title),
      type: "news",
    });

    return res.status(201).json({ message: "News created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateNewsAndUpdates = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { title, content, status } = req.body;
    const user = await getDataFromToken(req);
    const news = await NewsAndUpdates.findById(objectId);
    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    const featuredImages = await getUploadedFilePaths(req, "featured_image");

    let updatedContent = content || news.content;
    if (content) {
      updatedContent = await downloadImageAndReplaceSrcNonProperty(
        content,
        "news-and-updates"
      );
    }

    if (featuredImages && featuredImages.length > 0) {
      news.featured_image = featuredImages;
    }

    // Update fields
    news.title = title || news.title;
    news.content = updatedContent;
    news.author = user;
    news.status = status;
    if (status === "Published") {
      news.publish_date = Date.now();
    }

    const updatedNews = await news.save();

    autoAddAllSeo({
      type_id: updatedNews._id,
      title: title,
      description: updatedContent,
      slug: generateSlug(title),
      type: "news",
    });

    return res.status(200).json({ message: "News updated successfully", news });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllNewsAndUpdates = async (req, res) => {
  try {
    const news = await NewsAndUpdates.find().sort({ createdAt: -1 });
    return res.status(200).json(news);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getNewsAndUpdatesWithSeoBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    let seoData = await AllSeo.findOne({ slug, type: "news" });
    let news;

    if (seoData) {
      news = await NewsAndUpdates.findOne({ _id: seoData.news_id });
    } else {
      const allNews = await NewsAndUpdates.find();
      news = allNews.find((item) => generateSlug(item.title) === slug);
    }

    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    // Return only news if SEO is missing
    const finalNews = seoData
      ? { ...news.toObject(), seo: seoData }
      : news.toObject();

    return res.status(200).json(finalNews);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getNewsAndUpdatesByObjectId = async (req, res) => {
  try {
    const { objectId } = req.params;
    const news = await NewsAndUpdates.findOne({ _id: objectId });
    const author = await RegularUser.findOne({ _id: news.author });
    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }
    const finalData = { ...news?.toObject(), author: author?.name };
    return res.status(200).json(finalData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteNewsAndUpdates = async (req, res) => {
  try {
    const { objectId } = req.params;

    const news = await NewsAndUpdates.findByIdAndDelete(objectId);

    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    return res
      .status(200)
      .json({ message: "News deleted successfully", deletedNews: news });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
