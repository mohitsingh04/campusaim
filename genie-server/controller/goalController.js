import Goal from "../models/Goal.js";
import User from "../models/userModel.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import mongoose from "mongoose";
import { createNotification } from "../services/notification.service.js";

export const getCounselorGoals = async (req, res) => {
    try {
        const { counselorId } = req.params;

        // 🔒 Validate input
        if (!mongoose.Types.ObjectId.isValid(counselorId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid counselorId"
            });
        }

        const now = new Date();

        // ---------------- STATUS NORMALIZATION ----------------
        // Order matters (priority based)

        // 1️⃣ COMPLETED (highest priority)
        await Goal.updateMany(
            {
                counselorId,
                $expr: { $gte: ["$currentValue", "$targetValue"] }
            },
            { $set: { status: "completed" } }
        );

        // 2️⃣ NOT STARTED (future goals only if not completed)
        await Goal.updateMany(
            {
                counselorId,
                startDate: { $gt: now },
                status: { $ne: "completed" }
            },
            { $set: { status: "not_started" } }
        );

        // 3️⃣ EXPIRED (past goals only if not completed)
        await Goal.updateMany(
            {
                counselorId,
                endDate: { $lt: now },
                status: { $ne: "completed" }
            },
            { $set: { status: "expired" } }
        );

        // 4️⃣ ACTIVE (current running goals only if not completed)
        await Goal.updateMany(
            {
                counselorId,
                startDate: { $lte: now },
                endDate: { $gte: now },
                status: { $ne: "completed" }
            },
            { $set: { status: "active" } }
        );

        // ---------------- FETCH ----------------
        const goals = await Goal.find({ counselorId })
            .select("-__v")
            .sort({ startDate: -1 }) // better than createdAt
            .lean();

        // ---------------- NORMALIZE ----------------
        const normalizedGoals = goals.map(g => ({
            ...g,
            currentValue: Number(g.currentValue) || 0,
            targetValue: Number(g.targetValue) || 0,
            progressLogs: Array.isArray(g.progressLogs) ? g.progressLogs : []
        }));

        return res.status(200).json({
            success: true,
            goals: normalizedGoals
        });

    } catch (err) {
        console.error("[getCounselorGoals]", err);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const getAssignedGoals = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        // ---------------- AUTH ----------------
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }

        const user = await User.findById(userId)
            .select("_id role")
            .lean();

        if (!user || !["admin", "teamleader", "superadmin"].includes(user.role)) {
            return res.status(403).json({ success: false, error: "Access denied" });
        }

        // ---------------- QUERY ----------------
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        const search = req.query.search?.trim() || "";
        const status = req.query.status;
        const goalType = req.query.goalType;
        const counselorId = req.query.counselorId;

        const searchRegex = new RegExp(search, "i");

        // ---------------- MATCH ----------------
        const matchStage = {};

        // 👉 ROLE-BASED ACCESS CONTROL
        if (user.role === "teamleader") {
            // Only goals assigned by this TL OR to their counselors
            const counselors = await User.find({
                role: "counselor",
                teamLeader: user._id
            }).select("_id").lean();

            const counselorIds = counselors.map(c => c._id);

            matchStage.$or = [
                { assignedBy: user._id },
                { counselorId: { $in: counselorIds } }
            ];
        }

        // admin / superadmin → see all (no restriction)

        if (status) matchStage.status = status;
        if (goalType) matchStage.goalType = goalType;

        if (counselorId && mongoose.Types.ObjectId.isValid(counselorId)) {
            matchStage.counselorId = new mongoose.Types.ObjectId(counselorId);
        }

        // ---------------- AGGREGATION ----------------
        const [result] = await Goal.aggregate([

            { $match: matchStage },

            // counselor
            {
                $lookup: {
                    from: "users",
                    localField: "counselorId",
                    foreignField: "_id",
                    as: "counselorId"
                }
            },
            { $unwind: { path: "$counselorId", preserveNullAndEmptyArrays: true } },

            // assignedBy
            {
                $lookup: {
                    from: "users",
                    localField: "assignedBy",
                    foreignField: "_id",
                    as: "assignedBy"
                }
            },
            { $unwind: { path: "$assignedBy", preserveNullAndEmptyArrays: true } },

            // ---------------- SEARCH ----------------
            ...(search ? [{
                $match: {
                    $or: [
                        { "counselorId.name": searchRegex },
                        { "counselorId.email": searchRegex },
                        { "assignedBy.name": searchRegex },
                        { goalType: searchRegex }
                    ]
                }
            }] : []),

            // ---------------- FACET ----------------
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                __v: 0,
                                "counselorId.password": 0,
                                "assignedBy.password": 0
                            }
                        }
                    ]
                }
            }
        ]);

        const total = result.metadata[0]?.total || 0;
        const goals = result.data || [];

        return res.status(200).json({
            success: true,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: goals
        });

    } catch (error) {
        console.error("Get Assigned Goals Error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

export const assignGoal = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const user = await User.findById(userId)
            .select("_id name role")
            .lean();

        if (!user || !["admin", "teamleader"].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const {
            counselorId,
            goalPeriod,
            startDate,
            endDate,
            goals
        } = req.body;

        // ---------------- VALIDATION ----------------
        if (
            !mongoose.Types.ObjectId.isValid(counselorId) ||
            !goalPeriod ||
            !startDate ||
            !endDate ||
            !Array.isArray(goals) ||
            goals.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing or invalid required fields"
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            return res.status(400).json({
                success: false,
                message: "Invalid date range"
            });
        }

        // ---------------- VALIDATE COUNSELOR ----------------
        const counselor = await User.findById(counselorId)
            .select("_id role teamLeader")
            .lean();

        if (!counselor || counselor.role !== "counselor") {
            return res.status(400).json({
                success: false,
                message: "Invalid counselor"
            });
        }

        // 🔐 TEAMLEADER RESTRICTION (IMPORTANT)
        if (
            user.role === "teamleader" &&
            counselor.teamLeader?.toString() !== user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only assign goals to your counselors"
            });
        }

        const createdGoals = [];

        // ---------------- LOOP ----------------
        for (const item of goals) {
            const { goalType, targetValue } = item;

            if (!goalType || !targetValue || Number(targetValue) <= 0) continue;

            // ✅ OVERLAP CHECK (NO ORG)
            const overlap = await Goal.findOne({
                counselorId,
                goalType,
                status: { $in: ["active", "not_started"] },
                startDate: { $lte: end },
                endDate: { $gte: start }
            });

            if (overlap) {
                return res.status(400).json({
                    success: false,
                    message: "This goal already exists for this period"
                });
            }

            // ---------------- STATUS LOGIC ----------------
            const now = new Date();

            let status = "active";
            if (start > now) status = "not_started";
            else if (end < now) status = "expired";

            // ---------------- CREATE ----------------
            const goal = await Goal.create({
                counselorId,
                assignedBy: userId,
                goalType,
                goalPeriod,
                targetValue: Number(targetValue),
                startDate: start,
                endDate: end,
                status
            });

            createdGoals.push(goal);
        }

        if (createdGoals.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid goals provided"
            });
        }

        // ---------------- NOTIFICATION ----------------
        await createNotification({
            receiverId: counselorId,
            senderId: userId,
            type: "assigned_goal",
            title: "New Goals Assigned",
            message: `${user.name} assigned new goals to you.`,
            link: `/dashboard/my-goals`,
            meta: {
                goals: createdGoals.map(g => g.goalType)
            }
        });

        return res.status(201).json({
            success: true,
            message: "Goals assigned successfully",
            goals: createdGoals
        });

    } catch (error) {
        console.error("assignGoal error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};