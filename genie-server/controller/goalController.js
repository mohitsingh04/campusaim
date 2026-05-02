import mongoose from "mongoose";
import Goal from "../models/goal.js";
import RegularUser from "../models/regularUser.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import { createNotification } from "../services/notification.service.js";
import { mapRoleForApp, getDbRoleKey, getRoleId } from "../utils/roleMapper.js";

export const getCounselorGoals = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);
        const { counselorId } = req.params;

        /* ---------------- AUTH ---------------- */

        if (!mongoose.Types.ObjectId.isValid(authUserId)) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const authUser = await RegularUser.findById(authUserId)
            .populate("role", "role")
            .select("_id role")
            .lean();

        if (!authUser) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const authAppRole = mapRoleForApp(authUser.role?.role); // ✅ FIX

        /* ---------------- VALIDATE COUNSELOR ---------------- */

        if (!mongoose.Types.ObjectId.isValid(counselorId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid counselorId"
            });
        }

        const counselor = await RegularUser.findById(counselorId)
            .populate("role", "role")
            .select("_id role teamLeader")
            .lean();

        if (!counselor || mapRoleForApp(counselor.role?.role) !== "counselor") {
            return res.status(404).json({
                success: false,
                message: "Counselor not found"
            });
        }

        /* ---------------- ACCESS CONTROL ---------------- */

        const isAdmin = ["admin", "superadmin"].includes(authAppRole);

        const isTeamLeader =
            authAppRole === "teamleader" &&
            counselor.teamLeader?.toString() === authUser._id.toString();

        const isSelf =
            authAppRole === "counselor" &&
            authUser._id.toString() === counselor._id.toString();

        if (!isAdmin && !isTeamLeader && !isSelf) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const now = new Date();

        /* ---------------- STATUS NORMALIZATION ---------------- */

        await Goal.updateMany(
            {
                counselorId,
                $expr: { $gte: ["$currentValue", "$targetValue"] }
            },
            { $set: { status: "completed" } }
        );

        await Goal.updateMany(
            {
                counselorId,
                startDate: { $gt: now },
                status: { $ne: "completed" }
            },
            { $set: { status: "not_started" } }
        );

        await Goal.updateMany(
            {
                counselorId,
                endDate: { $lt: now },
                status: { $ne: "completed" }
            },
            { $set: { status: "expired" } }
        );

        await Goal.updateMany(
            {
                counselorId,
                startDate: { $lte: now },
                endDate: { $gte: now },
                status: { $ne: "completed" }
            },
            { $set: { status: "active" } }
        );

        /* ---------------- FETCH ---------------- */

        const goals = await Goal.find({ counselorId })
            .select("-__v")
            .sort({ startDate: -1 })
            .lean();

        /* ---------------- NORMALIZE ---------------- */

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

        /* ---------------- AUTH ---------------- */

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }

        const user = await RegularUser.findById(userId)
            .populate("role", "role")
            .select("_id role")
            .lean();

        if (!user) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }

        const userAppRole = mapRoleForApp(user.role?.role); // ✅ FIX

        if (!["admin", "teamleader", "superadmin"].includes(userAppRole)) {
            return res.status(403).json({ success: false, error: "Access denied" });
        }

        /* ---------------- QUERY ---------------- */

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        const search = req.query.search?.trim() || "";
        const status = req.query.status;
        const goalType = req.query.goalType;
        const counselorId = req.query.counselorId;

        const searchRegex = new RegExp(search, "i");

        /* ---------------- MATCH ---------------- */

        const matchStage = {};

        // 🔐 ROLE-BASED ACCESS
        if (userAppRole === "teamleader") {
            const counselorRoleId = await getRoleId("counselor");

            const counselors = await RegularUser.find({
                role: counselorRoleId,
                teamLeader: user._id
            }).select("_id").lean();

            const counselorIds = counselors.map(c => c._id);

            matchStage.$or = [
                { assignedBy: user._id },
                { counselorId: { $in: counselorIds } }
            ];
        }

        if (status) matchStage.status = status;
        if (goalType) matchStage.goalType = goalType;

        if (counselorId && mongoose.Types.ObjectId.isValid(counselorId)) {
            matchStage.counselorId = new mongoose.Types.ObjectId(counselorId);
        }

        /* ---------------- AGGREGATION ---------------- */

        const [result] = await Goal.aggregate([
            { $match: matchStage },

            // counselor
            {
                $lookup: {
                    from: "regularusers", // ✅ FIX
                    localField: "counselorId",
                    foreignField: "_id",
                    as: "counselor"
                }
            },
            { $unwind: { path: "$counselor", preserveNullAndEmptyArrays: true } },

            // assignedBy
            {
                $lookup: {
                    from: "regularusers", // ✅ FIX
                    localField: "assignedBy",
                    foreignField: "_id",
                    as: "assignedByUser"
                }
            },
            { $unwind: { path: "$assignedByUser", preserveNullAndEmptyArrays: true } },

            /* ---------------- SEARCH ---------------- */

            ...(search ? [{
                $match: {
                    $or: [
                        { "counselor.name": searchRegex },
                        { "counselor.email": searchRegex },
                        { "assignedByUser.name": searchRegex },
                        { goalType: searchRegex }
                    ]
                }
            }] : []),

            /* ---------------- FACET ---------------- */

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
                                "counselor.password": 0,
                                "assignedByUser.password": 0
                            }
                        }
                    ]
                }
            }
        ]);

        const total = result?.metadata?.[0]?.total || 0;
        const goals = result?.data || [];

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

        // 🔎 Auth user
        const user = await RegularUser.findById(userId)
            .populate("role", "role")
            .select("_id name role")
            .lean();

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const userAppRole = mapRoleForApp(user.role?.role); // ✅ FIX

        if (!["admin", "teamleader"].includes(userAppRole)) {
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

        /* ---------------- VALIDATION ---------------- */

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

        /* ---------------- VALIDATE COUNSELOR ---------------- */

        const counselor = await RegularUser.findById(counselorId)
            .populate("role", "role")
            .select("_id role teamLeader")
            .lean();

        if (!counselor) {
            return res.status(400).json({
                success: false,
                message: "Invalid counselor"
            });
        }

        const counselorAppRole = mapRoleForApp(counselor.role?.role); // ✅ FIX

        if (counselorAppRole !== "counselor") {
            return res.status(400).json({
                success: false,
                message: "Invalid counselor role"
            });
        }

        /* ---------------- TEAMLEADER RESTRICTION ---------------- */

        if (
            userAppRole === "teamleader" &&
            counselor.teamLeader?.toString() !== user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only assign goals to your counselors"
            });
        }

        const createdGoals = [];

        /* ---------------- LOOP ---------------- */

        for (const item of goals) {
            const { goalType, targetValue } = item;

            if (!goalType || !targetValue || Number(targetValue) <= 0) continue;

            // 🔁 OVERLAP CHECK
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

            /* ---------------- STATUS ---------------- */

            const now = new Date();

            let status = "active";
            if (start > now) status = "not_started";
            else if (end < now) status = "expired";

            /* ---------------- CREATE ---------------- */

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

        if (!createdGoals.length) {
            return res.status(400).json({
                success: false,
                message: "No valid goals provided"
            });
        }

        /* ---------------- NOTIFICATION ---------------- */

        try {
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
        } catch (err) {
            console.error("Notification error:", err);
        }

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