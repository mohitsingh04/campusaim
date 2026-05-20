import { downloadImageAndReplaceSrcNonProperty } from "../helper/folder-cleaners/EditorImagesController.js";
import AllSeo from "../models/AllSeo.js";
import Exam from "../models/Exam.js";
import { generateSlug, getUploadedFilePaths } from "../utils/Callback.js";
import { getDataFromToken } from "../utils/getDataFromToken.js";
import { autoAddAllSeo } from "./AllSeoController.js";

export const getExam = async (req, res) => {
  try {
    const exams = await Exam.find();
    return res.status(200).json(exams);
  } catch (err) {
    console.error("Error fetching exams:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error!" });
  }
};

export const getExamById = async (req, res) => {
  try {
    const { objectId } = req.params;
    const exam = await Exam.findById(objectId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found!" });
    }
    return res.status(200).json(exam);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

export const addExam = async (req, res) => {
  try {
    const userId = await getDataFromToken(req);

    const {
      exam_name,
      exam_short_name,
      exam_type,
      exam_sub_type,
      exam_tag,
      upcoming_exam_date,
      result_date,
      application_form_date,
      youtube_link,
      application_form_link,
      exam_form_link,
      exam_mode,
      description,
      faqs,
    } = req.body;

    if (!userId || !exam_name || !exam_type || !exam_short_name) {
      return res.status(400).json({ error: "Required Field Missing" });
    }

    const images = await getUploadedFilePaths(req, "image");
    const answer_sheet = req.files?.["answer_sheet"]?.[0]?.filename;
    const examTags = exam_tag ? JSON.parse(exam_tag) : [];
    const upcomingExamDate = upcoming_exam_date
      ? JSON.parse(upcoming_exam_date)
      : {};
    const resultDate = result_date ? JSON.parse(result_date) : {};
    const applicationFormDate = application_form_date
      ? JSON.parse(application_form_date)
      : {};
    const examFaq = faqs ? JSON.parse(faqs) : [];

    const examSlug = await generateSlug(exam_name);

    const existExam = await Exam.findOne({ exam_name });

    if (existExam) {
      return res.status(400).json({ error: "This exam already exists." });
    }

    let updatedDescription = description;
    if (description) {
      updatedDescription = await downloadImageAndReplaceSrcNonProperty(
        description,
        "exam",
      );
    }

    const payload = {
      userId,
      exam_name,
      exam_short_name,
      image: images,
      exam_type,
      exam_sub_type,
      exam_tag: examTags,
      description: updatedDescription,
      slug: examSlug,
      upcoming_exam_date: upcomingExamDate,
      result_date: resultDate,
      application_form_date: applicationFormDate,
      youtube_link,
      application_form_link,
      exam_form_link,
      exam_mode,
      answer_sheet,
      faqs: examFaq,
    };
    if (!payload.exam_sub_type || payload.exam_sub_type === "") {
      delete payload.exam_sub_type;
    }

    const newExam = new Exam(payload);

    const examCreated = await newExam.save();
    autoAddAllSeo({
      type_id: examCreated._id,
      title: exam_name,
      description: updatedDescription,
      slug: generateSlug(exam_name),
      type: "exam",
    });

    return res.status(201).json({ message: "Exam added successfully." });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

export const updateExam = async (req, res) => {
  try {
    const { objectId } = req.params;
    const exam = await Exam.findById(objectId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found!" });
    }

    const {
      exam_name,
      exam_short_name,
      exam_type,
      exam_sub_type,
      exam_tag,
      upcoming_exam_date,
      result_date,
      application_form_date,
      youtube_link,
      application_form_link,
      exam_form_link,
      exam_mode,
      description,
      faqs,
      status,
    } = req.body;

    let updatedDescription = description;
    if (description) {
      updatedDescription = await downloadImageAndReplaceSrcNonProperty(
        description,
        "exam",
      );
    }

    const imageFile = req.files?.["image"];
    const existImage = imageFile ? imageFile[0]?.webpFilename : exam.image?.[0];
    const existImageOriginal = imageFile
      ? imageFile[0]?.filename
      : exam.image?.[1];

    const answer_sheet = req.files?.["answer_sheet"]?.[0];
    const existAnswerSheet = answer_sheet
      ? answer_sheet?.filename
      : exam?.answer_sheet;
    const examTags = exam_tag ? JSON.parse(exam_tag) : exam.exam_tag;
    const upcomingExamDate = upcoming_exam_date
      ? JSON.parse(upcoming_exam_date)
      : {};
    const resultDate = result_date ? JSON.parse(result_date) : {};
    const applicationFormDate = application_form_date
      ? JSON.parse(application_form_date)
      : {};
    const examFaq = faqs ? JSON.parse(faqs) : [];

    const examUpdated = await Exam.findByIdAndUpdate(
      objectId,
      {
        $set: {
          exam_name,
          exam_short_name,
          exam_type,
          exam_sub_type,
          exam_tag: examTags,
          upcoming_exam_date: upcomingExamDate,
          result_date: resultDate,
          application_form_date: applicationFormDate,
          youtube_link,
          application_form_link,
          exam_form_link,
          exam_mode,
          image: [existImage, existImageOriginal],
          description: updatedDescription,
          status,
          faqs: examFaq,
          answer_sheet: existAnswerSheet,
        },
      },
      { new: true },
    );

    autoAddAllSeo({
      type_id: examUpdated._id,
      title: exam_name,
      description: updatedDescription,
      slug: generateSlug(exam_name),
      type: "exam",
    });

    return res.status(200).json({ message: "Exam updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

export const softDeleteExam = async (req, res) => {
  try {
    const { objectId } = req.params;
    const exam = await Exam.findById(objectId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found!" });
    }

    await Exam.findOneAndUpdate(
      { _id: objectId },
      { $set: { isDeleted: true, status: "Suspended" } },
    );

    return res.status(200).json({ message: "Exam is Softly Deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const { objectId } = req.params;

    const exam = await Exam.findById(objectId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found!" });
    }

    await Exam.findByIdAndDelete(objectId);
    return res.status(200).json({ message: "Exam deleted successfully." });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const restoreExam = async (req, res) => {
  try {
    const { objectId } = req.params;
    const exam = await Exam.findById(objectId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found!" });
    }

    await Exam.findOneAndUpdate(
      { _id: objectId },
      { $set: { isDeleted: false, status: "Active" } },
    );

    return res.status(200).json({ message: "Exam restored successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getExamWithSeoBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    let seoData = await AllSeo.findOne({ slug, type: "exam" });
    let exam;

    if (seoData) {
      // If SEO exists → fetch blog by ID
      exam = await Exam.findOne({ _id: seoData.exam_id });
    } else {
      const allexam = await Exam.find();
      exam = allexam.find((item) => generateSlug(item.exam_name) === slug);
    }

    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    // Return only blog if SEO is missing
    const finalExam = seoData
      ? { ...exam.toObject(), seo: seoData }
      : exam.toObject();

    return res.status(200).json(finalExam);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getExamMenuData = async (req, res) => {
  try {
    const exams = await Exam.find({
      isDeleted: false,
      status: "Active",
    })
      .select("exam_name exam_type exam_mode")
      .populate("exam_type", "category_name")
      .populate("exam_mode", "category_name")
      .lean();

    const examSeo = await AllSeo.find({
      type: "exam",
    }).lean();

    const seoMap = new Map(
      examSeo.map((seo) => [seo.exam_id?.toString(), seo]),
    );

    const menuData = {};

    const shuffled = [...exams].sort(() => Math.random() - 0.5);

    for (const exam of shuffled) {
      const examTypeName = exam?.exam_type?.category_name;

      const examModeName = exam?.exam_mode?.category_name?.toLowerCase();

      if (!examTypeName || !examModeName) continue;

      // ONLY ONLINE / OFFLINE
      if (examModeName !== "online" && examModeName !== "offline") {
        continue;
      }

      const matchedSeo = seoMap.get(exam?._id?.toString());

      if (!matchedSeo?.slug) continue;

      // CREATE CATEGORY
      if (!menuData[examTypeName]) {
        menuData[examTypeName] = [
          {
            title: "Online",
            links: [],
            viewAll: `/exams?exam_type=${generateSlug(
              examTypeName,
            )}&exam_mode=online`,
          },
          {
            title: "Offline",
            links: [],
            viewAll: `/exams?exam_type=${generateSlug(
              examTypeName,
            )}&exam_mode=offline`,
          },

          // SECOND PAIR
          {
            title: "Online",
            links: [],
            viewAll: `/exams?exam_type=${generateSlug(
              examTypeName,
            )}&exam_mode=online`,
          },
          {
            title: "Offline",
            links: [],
            viewAll: `/exams?exam_type=${generateSlug(
              examTypeName,
            )}&exam_mode=offline`,
          },
        ];
      }

      const onlineIndexes = [0, 2];
      const offlineIndexes = [1, 3];

      const targetIndexes =
        examModeName === "online" ? onlineIndexes : offlineIndexes;

      for (const index of targetIndexes) {
        // MAX 10 RESULTS
        if (menuData[examTypeName][index].links.length < 10) {
          menuData[examTypeName][index].links.push({
            name: exam.exam_name,
            href: `/exam/${matchedSeo.slug}`,
          });

          break;
        }
      }
    }

    // REMOVE EMPTY PAIRS
    const finalMenuData = {};

    for (const [examType, sections] of Object.entries(menuData)) {
      const filteredSections = sections.filter(
        (section) => section.links.length > 0,
      );

      // REMOVE CATEGORY IF EVERYTHING EMPTY
      if (filteredSections.length > 0) {
        finalMenuData[examType] = filteredSections;
      }
    }

    return res.status(200).json(finalMenuData);
  } catch (error) {
    console.error("Exam Menu Error:", error);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
