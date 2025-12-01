import {
  calculateSeoScore,
  generateSlug,
  stripHtml,
} from "../utils/Callback.js";
import AllSeo from "../models/AllSeo.js";

export const autoAddAllSeo = async ({
  type_id,
  title,
  description,
  slug,
  type,
}) => {
  if (!type_id) {
    throw new Error("type_id is required");
  }

  if (!type) {
    throw new Error("type is required");
  }

  if (!title || !slug) {
    throw new Error("title and slug are required");
  }

  // Map type to the correct field
  const typeFieldMap = {
    blog: "blog_id",
    course: "course_id",
    exam: "exam_id",
    retreat: "retreat_id",
    event: "event_id",
    news: "news_id",
  };

  const typeField = typeFieldMap[type];
  if (!typeField) {
    throw new Error("Invalid type provided");
  }

  // Primary focus keyword is always the title
  const primary_focus_keyword = [title];

  // Clean description (optional)
  const cleanDescription = description
    ? stripHtml(description)?.slice(0, 160)
    : "";

  // Find existing SEO by dynamic type field
  let seoEntry = await AllSeo.findOne({ [typeField]: type_id });

  if (seoEntry) {
    // Update only provided fields
    if (title) seoEntry.title = title;
    if (slug) seoEntry.slug = slug;
    if (description) seoEntry.meta_description = cleanDescription;

    seoEntry.primary_focus_keyword = primary_focus_keyword;
    seoEntry.type = type; // store type

    // Recalculate SEO score
    seoEntry.seo_score = await calculateSeoScore({
      title: seoEntry.title,
      slug: seoEntry.slug,
      meta_description: seoEntry.meta_description,
      primary_focus_keyword: seoEntry.primary_focus_keyword,
    });

    seoEntry[typeField] = type_id;

    await seoEntry.save();
    return { updated: true, message: "SEO updated successfully." };
  } else {
    const seo_score = await calculateSeoScore({
      title,
      slug,
      meta_description: cleanDescription,
      primary_focus_keyword,
    });

    const newSeo = new AllSeo({
      title,
      slug,
      meta_description: cleanDescription,
      primary_focus_keyword,
      seo_score,
      type,
      [typeField]: type_id,
    });

    await newSeo.save();
    return { success: true, message: "SEO added successfully." };
  }
};

export const CreateAllSeo = async (req, res) => {
  try {
    const {
      title,
      slug,
      meta_description,
      primary_focus_keyword,
      json_schema,
      blog_id,
      course_id,
      exam_id,
      event_id,
      news_id,
      retreat_id,
      type,
    } = req.body;

    if (!blog_id && !course_id && !exam_id && !event_id && !news_id && !retreat_id) {
      return res.status(400).json({
        error:
          "At least one reference ID (blog_id, course_id, exam_id, event_id,retreat_id, or news_id) must be provided.",
      });
    }

    if (primary_focus_keyword && primary_focus_keyword.length > 2) {
      return res
        .status(400)
        .json({ error: "You can add a maximum of 2 focus keywords." });
    }

    const seo_score = await calculateSeoScore({
      title,
      slug,
      meta_description,
      primary_focus_keyword,
    });

    const filter = {};
    if (blog_id) filter.blog_id = blog_id;
    if (course_id) filter.course_id = course_id;
    if (exam_id) filter.exam_id = exam_id;
    if (event_id) filter.event_id = event_id;
    if (news_id) filter.news_id = news_id;
    if (retreat_id) filter.retreat_id = retreat_id;

    // ✅ Upsert SEO document
    const seo = await AllSeo.findOneAndUpdate(
      filter,
      {
        $set: {
          title,
          slug: generateSlug(slug || title),
          meta_description,
          primary_focus_keyword,
          json_schema,
          blog_id,
          course_id,
          exam_id,
          event_id,
          news_id,
          retreat_id,
          seo_score,
          type: type || "general",
        },
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      message: "SEO data Generated successfully.",
      seo,
    });
  } catch (error) {
    console.error("Error adding/updating SEO:", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

export const getSeoByTypeId = async (req, res) => {
  try {
    const { type, type_id } = req.params;

    if (!type || !type_id) {
      return res.status(400).json({ error: "Type and type_id are required!" });
    }

    // Determine the correct query field based on `type`
    let query = {};
    switch (type) {
      case "blog":
        query.blog_id = type_id;
        break;
      case "course":
        query.course_id = type_id;
        break;
      case "exam":
        query.exam_id = type_id;
        break;
      case "event":
        query.event_id = type_id;
        break;
      case "news":
        query.news_id = type_id;
        break;
      case "retreat":
        query.retreat_id = type_id;
        break;
      default:
        return res.status(400).json({ error: "Invalid type provided!" });
    }

    // Find SEO record by the appropriate field
    const seo = await AllSeo.findOne(query);

    if (!seo) {
      return res.status(404).json({ error: "SEO record not found!" });
    }

    return res.status(200).json(seo);
  } catch (error) {
    console.error("Error fetching SEO by type ID:", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

export const getAllSeo = async (req, res) => {
  try {
    const { type } = req.query;
    let seoRecords;
    if (type) {
      seoRecords = await AllSeo.find({ type: type });
    } else {
      seoRecords = await AllSeo.find();
    }

    if (!seoRecords || seoRecords.length === 0) {
      return res.status(404).json({ error: "SEO records not found!" });
    }

    const updatedRecords = await Promise.all(
      seoRecords.map(async (record) => {
        if (
          record.seo_score === undefined ||
          record.seo_score === null ||
          !record?.seo_score
        ) {
          let seo_score = 0;

          if (record.title) seo_score += 25;
          if (record.slug) seo_score += 25;
          if (record.meta_description) seo_score += 25;

          if (
            record.primary_focus_keyword &&
            record.primary_focus_keyword.length > 0
          ) {
            seo_score += record.primary_focus_keyword.length * 12.5; // max 25
          }

          if (seo_score > 100) seo_score = 100;

          record.seo_score = seo_score;
          await record.save();
        }
        return record;
      })
    );

    return res.status(200).json(updatedRecords);
  } catch (error) {
    console.error("Error fetching SEO:", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};
