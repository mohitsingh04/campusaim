import mongoose from "mongoose";
import WithdrawRequest from "../models/withdrawRequest.js";
import IncentiveEarning from "../models/incentiveEarning.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import ComissionEarning from "../models/comissionEarning.js";

// ---------------- CREATE REQUEST ----------------
export const requestWithdraw = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);
        const { ids, type } = req.body; // 🔥 type added

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, error: "Invalid user" });
        }

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, error: "No earnings selected" });
        }

        if (!["incentive", "commission"].includes(type)) {
            return res.status(400).json({ success: false, error: "Invalid type" });
        }

        // 🔥 prevent duplicate request (per type)
        const existing = await WithdrawRequest.findOne({
            userId,
            type,
            status: "processing"
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                error: "Already have pending withdraw request"
            });
        }

        // 🔥 dynamic model
        const Model =
            type === "incentive" ? IncentiveEarning : ComissionEarning;

        // 🔥 dynamic filter (IMPORTANT)
        const userFilter =
            type === "incentive"
                ? { userId }
                : { partnerId: userId };

        const earnings = await Model.find({
            _id: { $in: ids },
            ...userFilter,
            status: "earned"
        });

        if (!earnings.length) {
            return res.status(400).json({
                success: false,
                error: "No valid earnings found"
            });
        }

        const totalAmount = earnings.reduce((sum, e) => sum + e.amount, 0);

        // ✅ create withdraw request
        const earningModel =
            type === "incentive"
                ? "IncentiveEarning"
                : "ComissionEarning";

        const request = await WithdrawRequest.create({
            userId,
            type,
            earningModel, // ✅ IMPORTANT
            earnings: earnings.map(e => e._id),
            totalAmount
        });

        // ✅ lock earnings
        await Model.updateMany(
            { _id: { $in: earnings.map(e => e._id) } },
            { $set: { status: "processing" } }
        );

        return res.json({
            success: true,
            message: "Withdraw request created",
            data: request
        });

    } catch (err) {
        console.error("requestWithdraw error:", err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

// ---------------- GET REQUESTS (ADMIN) ----------------
export const getWithdrawRequests = async (req, res) => {
    try {
        const requests = await WithdrawRequest.find()
            .populate("userId", "name email contact")
            .populate({
                path: "earnings",
                populate: { path: "leadId", select: "name contact email" }
            })
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: requests.length,
            data: requests
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

// ---------------- APPROVE ----------------
export const approveWithdraw = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await WithdrawRequest.findById(id);
        if (!request) return res.status(404).json({ error: "Not found" });

        // 🔥 dynamic model
        const Model =
            request.type === "incentive"
                ? IncentiveEarning
                : ComissionEarning;

        request.status = "approved";
        request.processedAt = new Date();
        await request.save();

        await Model.updateMany(
            { _id: { $in: request.earnings } },
            { $set: { status: "paid" } }
        );

        return res.json({ success: true, message: "Approved" });

    } catch (err) {
        console.error("approveWithdraw error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

// ---------------- REJECT ----------------
export const rejectWithdraw = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const request = await WithdrawRequest.findById(id);
        if (!request) return res.status(404).json({ error: "Not found" });

        // 🔥 dynamic model
        const Model =
            request.type === "incentive"
                ? IncentiveEarning
                : ComissionEarning;

        request.status = "rejected";
        request.reason = reason || "No reason provided";
        request.processedAt = new Date();
        await request.save();

        await Model.updateMany(
            { _id: { $in: request.earnings } },
            { $set: { status: "earned" } }
        );

        return res.json({ success: true, message: "Rejected" });

    } catch (err) {
        console.error("rejectWithdraw error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const getMyWithdrawRequests = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        const requests = await WithdrawRequest.find({
            userId: userId
        })
            .populate({
                path: "earnings",
                populate: { path: "leadId", select: "name contact email" }
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: requests
        });

    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};