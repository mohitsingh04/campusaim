import mongoose from "mongoose";
import axios from "axios";
import Comission from "../models/comission.js";
import ComissionEarning from "../models/comissionEarning.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";

// ================= MY COMISSION =================
export const getMyComission = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, error: "Invalid user" });
        }

        const earnings = await ComissionEarning
            .find({ partnerId: userId })
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

// ================= GET SINGLE =================
export const getPartnerComission = async (req, res) => {
    try {
        const { partnerId } = req.params;

        // ===== VALIDATION =====
        if (!mongoose.Types.ObjectId.isValid(partnerId)) {
            return res.status(400).json({ error: "Invalid partnerId" });
        }

        // ===== FETCH COMMISSION =====
        const data = await Comission.findOne({ partnerId });

        if (!data) {
            return res.status(200).json({
                success: true,
                data: null,
            });
        }

        // ===== FETCH COURSES FROM API =====
        let courseMap = {};

        try {
            const { data: courseRes } = await axios.get(`${process.env.CAMPUSAIM_API_URL}/api/course`);

            (courseRes || []).forEach((c) => {
                courseMap[c._id] = c.course_name;
            });

        } catch (err) {
            console.error("⚠️ Course API failed:", err.message);
        }

        // ===== MERGE =====
        const enriched = {
            ...data.toObject(),
            courseCommissions: data.courseCommissions.map((c) => ({
                ...c.toObject(),
                courseName: courseMap[c.courseId.toString()] || "N/A",
            })),
        };

        return res.status(200).json({
            success: true,
            data: enriched,
        });

    } catch (error) {
        console.error("❌ getPartnerComission:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

// ================= CREATE / UPDATE =================
export const upsertComission = async (req, res) => {
    try {
        const { partnerId, globalCommission, courseCommission } = req.body;

        // ===== VALIDATION =====
        if (!partnerId || !mongoose.Types.ObjectId.isValid(partnerId)) {
            return res.status(400).json({ error: "Invalid partnerId" });
        }

        if (globalCommission === undefined || globalCommission < 0) {
            return res.status(400).json({ error: "Invalid global commission" });
        }

        // sanitize course commissions
        let courseCommissions = [];
        if (courseCommission && typeof courseCommission === "object") {
            courseCommissions = Object.entries(courseCommission)
                .filter(([courseId, amount]) =>
                    mongoose.Types.ObjectId.isValid(courseId) && amount >= 0
                )
                .map(([courseId, amount]) => ({
                    courseId,
                    amount: Number(amount),
                }));
        }

        // ===== UPSERT =====
        const updated = await Comission.findOneAndUpdate(
            { partnerId },
            {
                partnerId,
                globalAmount: Number(globalCommission),
                courseCommissions,
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Commission saved",
            data: updated,
        });

    } catch (error) {
        console.error("❌ upsertComission:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

// ================= DELETE =================
export const deleteComission = async (req, res) => {
    try {
        const { partnerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(partnerId)) {
            return res.status(400).json({ error: "Invalid partnerId" });
        }

        await Comission.findOneAndDelete({ partnerId });

        return res.status(200).json({
            success: true,
            message: "Commission deleted",
        });

    } catch (error) {
        console.error("❌ deleteComission:", error);
        return res.status(500).json({ error: "Server error" });
    }
};