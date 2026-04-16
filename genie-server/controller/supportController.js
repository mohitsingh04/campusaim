// controllers/supportController.js
import mongoose from "mongoose";
import Support from "../models/support.js";
import User from "../models/userModel.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const sanitize = (str = "") => str.replace(/<[^>]*>?/gm, "").trim();

// allowed enums (avoid trusting client)
const ALLOWED_CATEGORY = ["general", "technical", "billing", "account", "feature"];
const ALLOWED_STATUS = ["open", "in_progress", "resolved", "closed"];

/* ---------------- CREATE SUPPORT ---------------- */
export const createSupport = async (req, res) => {
    try {
        const authId = await getDataFromToken(req);
        if (!authId) return res.status(401).json({ success: false, message: "Unauthorized" });

        if (!mongoose.Types.ObjectId.isValid(authId))
            return res.status(400).json({ success: false, message: "Invalid user id" });

        const authUser = await User.findById(authId).select("_id email");
        if (!authUser) return res.status(404).json({ success: false, message: "User not found" });

        let { name, email, category, subject, message } = req.body;

        // normalize early
        name = sanitize(name);
        email = sanitize(email).toLowerCase();
        subject = sanitize(subject);
        message = sanitize(message);

        /* -------- VALIDATION -------- */
        if (!name || name.length < 2)
            return res.status(400).json({ success: false, message: "Invalid name" });

        if (!EMAIL_REGEX.test(email))
            return res.status(400).json({ success: false, message: "Invalid email" });

        if (!subject || subject.length < 3)
            return res.status(400).json({ success: false, message: "Invalid subject" });

        if (!message || message.length < 10)
            return res.status(400).json({ success: false, message: "Invalid message" });

        if (category && !ALLOWED_CATEGORY.includes(category))
            return res.status(400).json({ success: false, message: "Invalid category" });

        /* -------- CREATE -------- */
        const support = await Support.create({
            name,
            email,
            category: category || "general",
            subject,
            message,
            createdBy: authUser._id,
        });

        return res.status(201).json({
            success: true,
            message: "Support request created.",
            data: support,
        });

    } catch (err) {
        console.error("createSupport error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getMySupport = async (req, res) => {
    try {
        const authId = await getDataFromToken(req);
        if (!authId) return res.status(401).json({ success: false, message: "Unauthorized" });

        if (!mongoose.Types.ObjectId.isValid(authId))
            return res.status(400).json({ success: false, message: "Invalid user id" });

        let { page = 1, limit = 10, search } = req.query;

        page = Math.max(1, Number(page) || 1);
        limit = Math.min(50, Number(limit) || 10);

        const query = { createdBy: authId };

        if (search) {
            query.$or = [
                { subject: { $regex: search, $options: "i" } },
                { message: { $regex: search, $options: "i" } }
            ];
        }

        const [data, total] = await Promise.all([
            Support.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Support.countDocuments(query)
        ]);

        return res.json({
            success: true,
            data,
            total,
            page
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};


/* ---------------- GET ALL (ADMIN) ---------------- */
export const getAllSupport = async (req, res) => {
    try {
        let { status, category, page = 1, limit = 10 } = req.query;

        page = Math.max(1, Number(page) || 1);
        limit = Math.min(50, Math.max(1, Number(limit) || 10)); // prevent abuse

        const query = {};

        if (status) {
            if (!ALLOWED_STATUS.includes(status))
                return res.status(400).json({ success: false, message: "Invalid status" });
            query.status = status;
        }

        if (category) {
            if (!ALLOWED_CATEGORY.includes(category))
                return res.status(400).json({ success: false, message: "Invalid category" });
            query.category = category;
        }

        const [supports, total] = await Promise.all([
            Support.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Support.countDocuments(query),
        ]);

        return res.status(200).json({
            success: true,
            data: supports,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });

    } catch (err) {
        console.error("getAllSupport error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


/* ---------------- GET BY ID ---------------- */
export const getSupportById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, message: "Invalid ID" });

        const support = await Support.findById(id).lean();

        if (!support)
            return res.status(404).json({ success: false, message: "Support not found" });

        return res.status(200).json({ success: true, data: support });

    } catch (err) {
        console.error("getSupportById error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


/* ---------------- UPDATE STATUS ---------------- */
export const updateSupportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, message: "Invalid ID" });

        if (!ALLOWED_STATUS.includes(status))
            return res.status(400).json({ success: false, message: "Invalid status" });

        const support = await Support.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!support)
            return res.status(404).json({ success: false, message: "Support not found" });

        return res.status(200).json({
            success: true,
            message: "Status updated",
            data: support,
        });

    } catch (err) {
        console.error("updateSupportStatus error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateMySupport = async (req, res) => {
    try {
        const authId = await getDataFromToken(req);
        if (!authId) return res.status(401).json({ success: false, message: "Unauthorized" });

        if (!mongoose.Types.ObjectId.isValid(authId))
            return res.status(400).json({ success: false, message: "Invalid user id" });
        
        const { id } = req.params;
        const { subject, message, category } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid ID" });

        const support = await Support.findById(id);

        if (!support)
            return res.status(404).json({ message: "Support not found" });

        /* -------- OWNERSHIP CHECK -------- */
        if (support.createdBy.toString() !== authId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        /* -------- STATUS CHECK -------- */
        if (support.status !== "open") {
            return res.status(400).json({
                message: "Cannot edit ticket after it is in progress or resolved"
            });
        }

        /* -------- UPDATE -------- */
        if (subject) support.subject = sanitize(subject);
        if (message) support.message = sanitize(message);
        if (category) support.category = category;

        await support.save();

        return res.json({
            success: true,
            message: "Support updated",
            data: support
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};