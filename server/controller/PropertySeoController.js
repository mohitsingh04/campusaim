import { addSeoScore } from "../analytic-controller/SeoScoreController.js";
import SeoScore from "../analytic-model/SeoScore.js";
import { calculateSeoScore, stripHtml } from "../utils/Callback.js";
import PropertySeo from "../models/PropertySeo.js";
import mongoose from "mongoose";

export const autoAddPropertySeo = async ({
  property_id,
  title,
  description,
  slug,
  primary_focus_keyword,
}) => {
  if (!property_id) {
    throw new Error("property_id is required");
  }

  let seoEntry = await PropertySeo.findOne({ property_id });

  if (seoEntry) {
    if (title) seoEntry.title = title;
    if (slug) seoEntry.slug = slug;
    if (description)
      seoEntry.meta_description = stripHtml(description)?.slice(0, 160);
    if (primary_focus_keyword && primary_focus_keyword.length > 0) {
      seoEntry.primary_focus_keyword = primary_focus_keyword;
    }

    const seo_score = await calculateSeoScore({
      title: seoEntry.title,
      slug: seoEntry.slug,
      meta_description: seoEntry.meta_description,
      primary_focus_keyword: seoEntry.primary_focus_keyword,
    });

    await seoEntry.save();
    await addSeoScore({ seo_score, property_id });

    return { updated: true, message: "SEO updated successfully." };
  } else {
    if (!title || !slug) {
      throw new Error("title and slug are required for new SEO entry");
    }

    const cleanDescription = description
      ? stripHtml(description)?.slice(0, 160)
      : "";

    const focusKeywords =
      primary_focus_keyword && primary_focus_keyword.length > 0
        ? primary_focus_keyword
        : [title];

    const seo_score = await calculateSeoScore({
      title,
      slug,
      meta_description: cleanDescription,
      primary_focus_keyword: focusKeywords,
    });

    const newSeo = new PropertySeo({
      title,
      slug,
      meta_description: cleanDescription,
      primary_focus_keyword: focusKeywords,
      property_id,
    });

    await newSeo.save();
    await addSeoScore({ seo_score, property_id });

    return { success: true, message: "SEO added successfully." };
  }
};

export const addPropertySeo = async (req, res) => {
  try {
    const {
      title,
      slug,
      meta_description,
      primary_focus_keyword,
      json_schema,
      property_id,
    } = req.body;

    const seo_score = await calculateSeoScore({
      title,
      slug,
      meta_description,
      primary_focus_keyword,
    });

    if (primary_focus_keyword.length > 2) {
      return res
        .status(400)
        .json({ error: "You can add a maximum of 2 focus keywords." });
    }

    const existSeo = await PropertySeo.findOne({ title, property_id });
    if (existSeo) {
      return res.status(400).json({ error: "This SEO title already exists!" });
    }

    const newSeo = new PropertySeo({
      title,
      slug,
      meta_description,
      primary_focus_keyword,
      json_schema,
      property_id,
    });

    await newSeo.save();
    await addSeoScore({ seo_score, property_id });
    return res.status(201).json({ message: "SEO added successfully." });
  } catch (error) {
    console.error("Error adding SEO:", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

export const updatePropertySeo = async (req, res) => {
  try {
    const { objectId } = req.params;
    const {
      title,
      slug,
      meta_description,
      primary_focus_keyword,
      json_schema,
      status,
    } = req.body;

    const existSeo = await PropertySeo.findById(objectId);
    if (!existSeo) {
      return res.status(404).json({ error: "SEO record not found." });
    }

    const seo_score = await calculateSeoScore({
      title,
      slug,
      meta_description,
      primary_focus_keyword,
    });

    if (primary_focus_keyword.length > 2) {
      return res
        .status(400)
        .json({ error: "You can add a maximum of 3 focus keywords." });
    }

    await PropertySeo.findByIdAndUpdate(
      objectId,
      {
        title,
        slug,
        meta_description,
        primary_focus_keyword,
        json_schema,
        status,
      },
      { new: true }
    );

    await addSeoScore({
      seo_score,
      property_id: existSeo?.property_id,
    });

    return res.status(200).json({ message: "SEO updated successfully." });
  } catch (error) {
    console.error("Error updating SEO:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getPropertySeo = async (req, res) => {
  try {
    const seo = await PropertySeo.find();
    return res.status(200).json(seo);
  } catch (error) {
    console.error("Error fetching SEO data:", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

export const getPropertySeoById = async (req, res) => {
  try {
    const { objectId } = req.params;
    const seo = await PropertySeo.findById(objectId);

    if (!seo) {
      return res.status(404).json({ error: "SEO record not found!" });
    }

    return res.status(200).json(seo);
  } catch (error) {
    console.error("Error fetching SEO by ID:", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

export const getPropertySeoByPropertyId = async (req, res) => {
  try {
    const { property_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(property_id)) {
      return res.status(400).json({ error: "Invalid property ID" });
    }

    const seo = await PropertySeo.findOne({
      property_id: new mongoose.Types.ObjectId(property_id),
    });

    if (!seo) {
      return res.status(404).json({ error: "SEO record not found!" });
    }

    return res.status(200).json(seo);
  } catch (error) {
    console.error("Error fetching SEO by Property ID:", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};


export const deletePropertySeo = async (req, res) => {
  try {
    const { objectId } = req.params;
    const seo = await PropertySeo.findById(objectId);

    if (!seo) {
      return res.status(404).json({ error: "SEO entry not found." });
    }

    await PropertySeo.findByIdAndDelete(objectId);
    await SeoScore.findOneAndDelete({ property_id: seo?.property_id });
    return res.status(200).json({ message: "SEO entry deleted successfully." });
  } catch (error) {
    console.error("Error deleting SEO entry:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
