import { downloadImageAndReplaceSrcNonProperty } from "../helper/folder-cleaners/EditorImagesController.js";
import RegularUser from "../profile-model/RegularUser.js";
import { generateSlug } from "../utils/Callback.js";
import { getDataFromToken } from "../utils/getDataFromToken.js";
import { autoAddAllSeo } from "./AllSeoController.js";
import Scholarship from "../models/Scholarship.js";

export const getScholarship = async (req, res) => {
    try {
        const scholarships = await Scholarship.find();
        return res.status(200).json(scholarships);
    } catch (err) {
        console.error("Error fetching scholarships:", err);
        return res
            .status(500)
            .json({ success: false, error: "Internal Server Error!" });
    }
};

export const getScholarshipById = async (req, res) => {
    try {
        const { objectId } = req.params;
        const scholarship = await Scholarship.findById(objectId);
        if (!scholarship) {
            return res.status(404).json({ error: "Scholarship not found!" });
        }
        return res.status(200).json(scholarship);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error!" });
    }
};

export const getScholarshipWithSeoBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        // 1️⃣ Try finding SEO data first
        let seoData = await AllSeo.findOne({ slug, type: "scholarship" });
        let scholarship;

        if (seoData) {
            // If SEO exists → fetch blog by ID
            scholarship = await Scholarship.findOne({ _id: seoData.scholarship_id });
        } else {
            const allscholarship = await Scholarship.find();
            scholarship = allscholarship.find(
                (item) => generateSlug(item.scholarship_title) === slug
            );
        }

        if (!scholarship) {
            return res.status(404).json({ error: "Blog not found" });
        }

        // Return only blog if SEO is missing
        const finalScholarship = seoData
            ? { ...scholarship.toObject(), seo: seoData }
            : scholarship.toObject();

        return res.status(200).json(finalScholarship);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const addScholarship = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        const user = await RegularUser.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const {
            scholarship_title,
            scholarship_type,
            scholarship_description,
        } = req.body;

        const scholarshipSlug = await generateSlug(scholarship_title);

        const existScholarship = await Scholarship.findOne({ scholarship_title });

        if (existScholarship) {
            return res.status(400).json({ error: "This scholarship already exists." });
        }

        let updatedDescription = scholarship_description;
        if (scholarship_description) {
            updatedDescription = await downloadImageAndReplaceSrcNonProperty(
                scholarship_description,
                "scholarship"
            );
        }

        const newScholarship = new Scholarship({
            userId: user._id,
            slug: scholarshipSlug,
            scholarship_title,
            scholarship_type,
            scholarship_description: updatedDescription,
        });

        const scholarshipCreated = await newScholarship.save();
        autoAddAllSeo({
            type_id: scholarshipCreated._id,
            title: scholarship_title,
            description: updatedDescription,
            slug: generateSlug(scholarship_title),
            type: "scholarship",
        });

        return res.status(201).json({ message: "Scholarship added successfully." });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error!" });
    }
};

export const updateScholarship = async (req, res) => {
    try {
        const { objectId } = req.params;
        const scholarship = await Scholarship.findById(objectId);
        if (!scholarship) {
            return res.status(404).json({ error: "Scholarship not found!" });
        }

        // Helper: ensure a value that may be JSON-stringified is parsed
        const safeParse = (val) => {
            if (val === undefined || val === null) return undefined;
            if (typeof val === "object") return val;
            try {
                return JSON.parse(val);
            } catch {
                return val;
            }
        };

        // Helper: ensure an incoming value is an array (if single value, wrap)
        const ensureArray = (val) => {
            if (val === undefined || val === null) return undefined;
            if (Array.isArray(val)) return val;
            return String(val).split(",").map((s) => s.trim()).filter(Boolean);
        };

        // Helper: convert possible string "true"/"false" to boolean
        const toBoolean = (v) => {
            if (typeof v === "boolean") return v;
            if (typeof v === "number") return Boolean(v);
            if (!v && v !== "") return undefined;
            const s = String(v).toLowerCase();
            if (s === "true" || s === "1") return true;
            if (s === "false" || s === "0") return false;
            return undefined;
        };

        // Destructure raw body (we'll sanitize below)
        const raw = {
            scholarship_title: req.body.scholarship_title,
            scholarship_type: req.body.scholarship_type,
            scholarship_description: req.body.scholarship_description,
            age_criteria: safeParse(req.body.age_criteria),
            qualification: req.body.qualification,
            marks: safeParse(req.body.marks),
            location: safeParse(req.body.location) ?? ensureArray(req.body.location),
            card: safeParse(req.body.card) ?? ensureArray(req.body.card),
            sports_quotas: toBoolean(req.body.sports_quotas),
            gender: safeParse(req.body.gender) ?? ensureArray(req.body.gender),
            cast: safeParse(req.body.cast) ?? ensureArray(req.body.cast),
            religion: safeParse(req.body.religion) ?? ensureArray(req.body.religion),
            entrance_exam:
                safeParse(req.body.entrance_exam) ?? ensureArray(req.body.entrance_exam),
            scholarship_exam: toBoolean(req.body.scholarship_exam),
            scholarship_link: req.body.scholarship_link,
            scholarship_amount: safeParse(req.body.scholarship_amount),
            army_quota: toBoolean(req.body.army_quota),
            annual_income: safeParse(req.body.annual_income),
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            status: req.body.status,
        };

        // If description present, download/replace images
        let updatedDescription = raw.scholarship_description;
        if (raw.scholarship_description) {
            updatedDescription = await downloadImageAndReplaceSrcNonProperty(
                raw.scholarship_description,
                "scholarship"
            );
        }

        // Normalize age_criteria -> { min: Number, max: Number }
        const normalizedAge = (() => {
            const a = raw.age_criteria ?? {};
            if (typeof a === "number") return { min: a, max: a };
            return {
                min:
                    a && a.min !== undefined && a.min !== null
                        ? Number(a.min)
                        : undefined,
                max:
                    a && a.max !== undefined && a.max !== null
                        ? Number(a.max)
                        : undefined,
            };
        })();

        // Normalize marks -> { min: Number, max: Number }
        const normalizedMarks = (() => {
            const m = raw.marks ?? {};
            if (typeof m === "number") return { min: m, max: m };
            return {
                min:
                    m && m.min !== undefined && m.min !== null ? Number(m.min) : undefined,
                max:
                    m && m.max !== undefined && m.max !== null ? Number(m.max) : undefined,
            };
        })();

        // Normalize scholarship_amount and annual_income -> ensure numeric values
        const normalizeCurrencyObject = (obj) => {
            if (!obj) return undefined;
            // if Map-like or object
            try {
                const entries =
                    typeof obj === "object" && !Array.isArray(obj)
                        ? Object.entries(obj)
                        : Array.isArray(obj)
                            ? obj
                            : Object.entries(JSON.parse(String(obj)));
                const converted = Object.fromEntries(
                    entries.map(([k, v]) => [k, Number(v === "" ? 0 : v)])
                );
                return converted;
            } catch {
                return undefined;
            }
        };

        const normalizedScholarshipAmount = normalizeCurrencyObject(
            raw.scholarship_amount
        );
        const normalizedAnnualIncome = normalizeCurrencyObject(raw.annual_income);

        // Build update object only for provided fields (avoid overwriting with undefined)
        const updateFields = {};

        if (raw.scholarship_title !== undefined) updateFields.scholarship_title = raw.scholarship_title;
        if (raw.scholarship_type !== undefined) updateFields.scholarship_type = raw.scholarship_type;
        if (raw.scholarship_description !== undefined) updateFields.scholarship_description = updatedDescription;
        if (raw.qualification !== undefined) updateFields.qualification = raw.qualification;

        // only set age_criteria if at least one subfield provided
        if (normalizedAge.min !== undefined || normalizedAge.max !== undefined) {
            updateFields.age_criteria = {};
            if (normalizedAge.min !== undefined) updateFields.age_criteria.min = normalizedAge.min;
            if (normalizedAge.max !== undefined) updateFields.age_criteria.max = normalizedAge.max;
        }

        if (normalizedMarks.min !== undefined || normalizedMarks.max !== undefined) {
            updateFields.marks = {};
            if (normalizedMarks.min !== undefined) updateFields.marks.min = normalizedMarks.min;
            if (normalizedMarks.max !== undefined) updateFields.marks.max = normalizedMarks.max;
        }

        if (raw.location !== undefined) updateFields.location = Array.isArray(raw.location) ? raw.location : ensureArray(raw.location);
        if (raw.card !== undefined) updateFields.card = Array.isArray(raw.card) ? raw.card : ensureArray(raw.card);
        if (raw.gender !== undefined) updateFields.gender = Array.isArray(raw.gender) ? raw.gender : ensureArray(raw.gender);
        if (raw.cast !== undefined) updateFields.cast = Array.isArray(raw.cast) ? raw.cast : ensureArray(raw.cast);
        if (raw.religion !== undefined) updateFields.religion = Array.isArray(raw.religion) ? raw.religion : ensureArray(raw.religion);
        if (raw.entrance_exam !== undefined) updateFields.entrance_exam = Array.isArray(raw.entrance_exam) ? raw.entrance_exam : ensureArray(raw.entrance_exam);

        if (raw.sports_quotas !== undefined) updateFields.sports_quotas = raw.sports_quotas;
        if (raw.scholarship_exam !== undefined) updateFields.scholarship_exam = raw.scholarship_exam;
        if (raw.scholarship_link !== undefined) updateFields.scholarship_link = raw.scholarship_link;
        if (normalizedScholarshipAmount !== undefined) updateFields.scholarship_amount = normalizedScholarshipAmount;
        if (normalizedAnnualIncome !== undefined) updateFields.annual_income = normalizedAnnualIncome;
        if (raw.army_quota !== undefined) updateFields.army_quota = raw.army_quota;

        // parse dates if provided
        if (raw.start_date !== undefined && raw.start_date !== "")
            updateFields.start_date = new Date(raw.start_date);

        if (raw.end_date !== undefined && raw.end_date !== "")
            updateFields.end_date = new Date(raw.end_date);

        if (raw.status !== undefined) updateFields.status = raw.status;

        const scholarshipUpdated = await Scholarship.findByIdAndUpdate(
            objectId,
            { $set: updateFields },
            { new: true }
        );

        if (!scholarshipUpdated) {
            return res.status(500).json({ error: "Failed to update scholarship." });
        }

        autoAddAllSeo({
            type_id: scholarshipUpdated._id,
            title: updateFields.scholarship_title || scholarshipUpdated.scholarship_title,
            description: updateFields.scholarship_description || scholarshipUpdated.scholarship_description,
            slug: generateSlug(updateFields.scholarship_title || scholarshipUpdated.scholarship_title || scholarshipUpdated.slug || ""),
            type: "scholarship",
        });

        return res.status(200).json({ message: "Scholarship updated successfully.", data: scholarshipUpdated });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error!" });
    }
};

export const deleteScholarship = async (req, res) => {
    try {
        const { objectId } = req.params;

        const scholarship = await Scholarship.findById(objectId);
        if (!scholarship) {
            return res.status(404).json({ error: "Scholarship not found!" });
        }

        await Scholarship.findByIdAndDelete(objectId);
        return res.status(200).json({ message: "Scholarship deleted successfully." });
    } catch (error) {
        console.error("Error deleting scholarship:", error);
        return res.status(500).json({ error: "Internal Server Error." });
    }
};