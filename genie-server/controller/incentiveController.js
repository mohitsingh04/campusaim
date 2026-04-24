import mongoose from "mongoose";
import Incentive from "../models/incentive.js";
import User from "../models/userModel.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import axios from "axios";
import IncentiveEarning from "../models/incentiveEarning.js";

// ---------------- HELPER ----------------
export const calculateIncentive = async (lead) => {
    const config = await Incentive.findOne({ userId: lead.counselorId });

    if (!config) return 0;

    const courseMatch = config.courseIncentives.find(
        c => c.courseId.toString() === lead.courseId.toString()
    );

    return courseMatch ? courseMatch.amount : config.globalAmount;
};

// ---------------- GET ----------------
export const getIncentive = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, error: "Invalid userId" });
        }

        const incentive = await Incentive.findOne({ userId });

        return res.status(200).json({ success: true, data: incentive || null });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

export const getMyEarnings = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, error: "Invalid user" });
        }

        const earnings = await IncentiveEarning
            .find({ userId: userId })
            .sort({ createdAt: -1 })
            .lean();

        const total = earnings.reduce((sum, e) => sum + (e.amount || 0), 0);

        return res.json({
            success: true,
            total,
            count: earnings.length,
            data: earnings
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

export const getIncentiveWithCourses = async (req, res) => {
    try {
        const { userId } = req.params;

        const incentive = await Incentive.findOne({ userId });

        const { data } = await axios.get(`${process.env.CAMPUSAIM_API_URL}/api/course`);

        const courses = data;

        const map = {};
        incentive?.courseIncentives?.forEach(i => {
            map[i.courseId] = i.amount;
        });

        const merged = courses.map(c => ({
            ...c,
            incentive: map[c._id] || null
        }));

        return res.json({
            success: true,
            data: merged,
            incentiveId: incentive?._id || null,
            globalAmount: incentive?.globalAmount || null,
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

// ---------------- CREATE ----------------
export const createIncentive = async (req, res) => {
    try {
        const adminId = await getDataFromToken(req);

        // ===== AUTH =====
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }

        const admin = await User.findById(adminId).select("role");
        if (!["admin", "superadmin"].includes(admin?.role)) {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }

        const { userId, globalAmount, courseIncentives } = req.body;

        // ===== VALIDATION =====
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, error: "Invalid userId" });
        }

        const user = await User.findById(userId).select("role");
        if (!["counselor", "teamleader"].includes(user?.role)) {
            return res.status(400).json({ success: false, error: "Invalid user role" });
        }

        // ===== PREVENT DUPLICATE =====
        const exists = await Incentive.findOne({ userId });
        if (exists) {
            return res.status(400).json({
                success: false,
                error: "Incentive already exists (use update)"
            });
        }

        // ===== SANITIZE COURSE =====
        let incentivesArray = [];

        if (Array.isArray(courseIncentives)) {
            incentivesArray = courseIncentives;
        } else if (typeof courseIncentives === "object" && courseIncentives !== null) {
            incentivesArray = Object.entries(courseIncentives).map(([courseId, amount]) => ({
                courseId,
                amount
            }));
        }

        const validated = incentivesArray
            .filter(item =>
                mongoose.Types.ObjectId.isValid(item.courseId) &&
                item.amount !== undefined &&
                Number(item.amount) >= 0
            )
            .map(item => ({
                courseId: item.courseId,
                amount: Number(item.amount)
            }));

        // ===== FLEXIBLE VALIDATION =====
        const hasGlobal =
            globalAmount !== undefined &&
            globalAmount !== null &&
            globalAmount !== "" &&
            Number(globalAmount) >= 0;

        if (!hasGlobal && validated.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Either global amount or course incentives required"
            });
        }

        // ===== CREATE =====
        const incentive = await Incentive.create({
            userId,
            globalAmount: hasGlobal ? Number(globalAmount) : null,
            courseIncentives: validated
        });

        return res.status(201).json({
            success: true,
            data: incentive
        });

    } catch (err) {
        console.error("❌ createIncentive:", err);
        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
};

// ---------------- UPDATE ----------------
export const updateIncentive = async (req, res) => {
    try {
        const adminId = await getDataFromToken(req);

        // ===== AUTH =====
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }

        const admin = await User.findById(adminId).select("role");
        if (!["admin", "superadmin"].includes(admin?.role)) {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }

        const { id } = req.params;
        const { globalAmount, courseIncentives } = req.body;

        // ===== VALIDATION =====
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid id" });
        }

        const incentive = await Incentive.findById(id);
        if (!incentive) {
            return res.status(404).json({ success: false, error: "Incentive not found" });
        }

        // ===== SANITIZE COURSE =====
        let incentivesArray = [];

        if (Array.isArray(courseIncentives)) {
            incentivesArray = courseIncentives;
        } else if (typeof courseIncentives === "object" && courseIncentives !== null) {
            incentivesArray = Object.entries(courseIncentives).map(([courseId, amount]) => ({
                courseId,
                amount
            }));
        }

        const validated = incentivesArray
            .filter(item =>
                mongoose.Types.ObjectId.isValid(item.courseId) &&
                item.amount !== undefined &&
                Number(item.amount) >= 0
            )
            .map(item => ({
                courseId: item.courseId,
                amount: Number(item.amount)
            }));

        // ===== FLEXIBLE VALIDATION =====
        const hasGlobal =
            globalAmount !== undefined &&
            globalAmount !== null &&
            globalAmount !== "" &&
            Number(globalAmount) >= 0;

        if (!hasGlobal && validated.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Either global amount or course incentives required"
            });
        }

        // ===== UPDATE =====
        const updated = await Incentive.findByIdAndUpdate(
            id,
            {
                globalAmount: hasGlobal ? Number(globalAmount) : null,
                courseIncentives: validated
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            data: updated
        });

    } catch (err) {
        console.error("❌ updateIncentive:", err);
        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
};

// ================= DELETE =================
export const deleteIncentive = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        await Incentive.findOneAndDelete({ userId });

        return res.status(200).json({
            success: true,
            message: "Commission deleted",
        });

    } catch (error) {
        console.error("❌ deleteIncentive:", error);
        return res.status(500).json({ error: "Server error" });
    }
};