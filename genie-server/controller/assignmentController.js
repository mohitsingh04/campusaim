import mongoose from "mongoose";
import User from "../models/userModel.js";
import Lead from "../models/leadsModel.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import { notifyCounselorAssignment, notifyLeadAssignment } from "../helper/notification/notificationHelper.js";

/* ---------------- ASSIGN LEADS CONTROLLER ---------------- */
export const assignLeads = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);
        const { leadIds, assignToId } = req.body;

        /* ---------------- VALIDATION ---------------- */
        if (!Array.isArray(leadIds) || !leadIds.length) {
            return res.status(400).json({ error: "Lead IDs required" });
        }

        if (!mongoose.Types.ObjectId.isValid(assignToId)) {
            return res.status(400).json({ error: "Invalid target user" });
        }

        const sanitizedLeadIds = leadIds.filter(id =>
            mongoose.Types.ObjectId.isValid(id)
        );

        if (!sanitizedLeadIds.length) {
            return res.status(400).json({ error: "No valid lead IDs provided" });
        }

        const authUser = await User
            .findById(authUserId)
            .select("_id name role");

        const assignToUser = await User
            .findById(assignToId)
            .select("_id role teamLeader");

        if (!authUser || !assignToUser) {
            return res.status(404).json({ error: "User not found" });
        }

        /* ================= ADMIN LOGIC ================= */
        if (authUser.role === "admin") {

            const leads = await Lead.find({
                _id: { $in: sanitizedLeadIds }
            }).select("_id assignedTo teamLeader");

            const validLeadIds = leads
                .filter(l => l.assignedTo?.toString() !== assignToId)
                .map(l => l._id);

            if (!validLeadIds.length) {
                return res.status(200).json({
                    message: "Leads already assigned to this user",
                    noChange: true
                });
            }

            /* -------- Admin → TeamLeader -------- */
            if (assignToUser.role === "teamleader") {

                await Lead.updateMany(
                    { _id: { $in: validLeadIds } },
                    {
                        $set: {
                            assignedTo: assignToUser._id,
                            teamLeader: assignToUser._id
                        },
                        $push: {
                            assignmentHistory: {
                                assignedTo: assignToUser._id,
                                assignedBy: authUser._id,
                                role: "admin"
                            }
                        }
                    }
                );
            }

            /* -------- Admin → Counselor -------- */

            if (assignToUser.role === "counselor") {
                await Lead.updateMany(
                    { _id: { $in: validLeadIds } },
                    {
                        $set: {
                            assignedTo: assignToUser._id,
                            teamLeader: assignToUser.teamLeader
                        },
                        $push: {
                            assignmentHistory: {
                                assignedTo: assignToUser._id,
                                assignedBy: authUser._id,
                                role: "admin"
                            }
                        }
                    }
                );
            }

            /* -------- SEND NOTIFICATION -------- */
            await notifyLeadAssignment({
                assignToUser,
                authUser,
                leadIds: validLeadIds
            });

            return res.status(200).json({
                message: "Leads assigned successfully"
            });
        }

        /* ================= TEAMLEADER LOGIC ================= */

        if (authUser.role === "teamleader") {

            if (assignToUser.role !== "counselor") {
                return res.status(403).json({
                    error: "TeamLeader can assign only to counselors"
                });
            }

            if (assignToUser.teamLeader?.toString() !== authUserId.toString()) {
                return res.status(403).json({
                    error: "Counselor not under this team leader"
                });
            }

            const leads = await Lead.find({
                _id: { $in: sanitizedLeadIds },
                teamLeader: authUserId
            }).select("_id assignedTo");

            const validLeadIds = leads
                .filter(l => l.assignedTo?.toString() !== assignToId)
                .map(l => l._id);

            if (!validLeadIds.length) {
                return res.status(200).json({
                    message: "Leads already assigned to this Counselor",
                    noChange: true
                });
            }

            await Lead.updateMany(
                { _id: { $in: validLeadIds } },
                {
                    $set: {
                        assignedTo: assignToUser._id
                    },
                    $push: {
                        assignmentHistory: {
                            assignedTo: assignToUser._id,
                            assignedBy: authUser._id,
                            role: "teamleader"
                        }
                    }
                }
            );

            /* -------- SEND NOTIFICATION -------- */

            await notifyLeadAssignment({
                assignToUser,
                authUser,
                leadIds: validLeadIds
            });

            return res.status(200).json({
                message: "Leads assigned successfully"
            });
        }

        return res.status(403).json({
            error: "Access denied"
        });

    } catch (error) {

        console.error("Assign Leads Error:", error);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const getAssignedCounselors = async (req, res) => {
    try {
        const { teamLeaderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(teamLeaderId)) {
            return res.status(400).json({ error: "Invalid teamLeaderId" });
        }

        // 1️⃣ Fetch counselors under this team leader
        const counselors = await User.find({
            role: "counselor",
            teamLeader: teamLeaderId
        }).select("_id name email contact status");

        const counselorIds = counselors.map(c => c._id);

        // 2️⃣ Aggregate lead count per counselor
        const leadCounts = await Lead.aggregate([
            {
                $match: {
                    $or: [
                        { createdBy: { $in: counselorIds } },
                        { assignedTo: { $in: counselorIds } }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $ifNull: ["$assignedTo", "$createdBy"]
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        const leadCountMap = {};
        leadCounts.forEach(l => {
            leadCountMap[l._id.toString()] = l.count;
        });

        // 3️⃣ Attach leadCount to counselors
        const response = counselors.map(c => ({
            ...c.toObject(),
            leadCount: leadCountMap[c._id.toString()] || 0
        }));

        return res.status(200).json({ data: response });

    } catch (err) {
        console.error("getAssignedCounselors error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const assignCounselorToTeamLeader = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);

        const authUser = await User.findById(authUserId)
            .select("_id role name");

        if (!authUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!["admin", "partner"].includes(authUser.role)) {
            return res.status(403).json({ error: "Permission denied" });
        }

        const { counselorId } = req.params;
        const { teamLeaderId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(counselorId)) {
            return res.status(400).json({ error: "Invalid counselor ID" });
        }

        const counselor = await User.findOne({
            _id: counselorId,
            role: "counselor",
        }).select("_id name teamLeader");

        if (!counselor) {
            return res.status(404).json({ error: "Counselor not found" });
        }

        /* ---------------- UNASSIGN ---------------- */
        if (!teamLeaderId) {
            counselor.teamLeader = null;
            await counselor.save();

            return res.status(200).json({
                success: true,
                message: "Counselor unassigned successfully"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(teamLeaderId)) {
            return res.status(400).json({ error: "Invalid teamLeader ID" });
        }

        const teamLeader = await User.findOne({
            _id: teamLeaderId,
            role: "teamleader",
        }).select("_id name");

        if (!teamLeader) {
            return res.status(404).json({ error: "TeamLeader not found" });
        }

        if (counselor.teamLeader?.equals(teamLeader._id)) {
            return res.status(200).json({
                message: "Counselor already assigned to this team leader"
            });
        }

        counselor.teamLeader = teamLeader._id;
        await counselor.save();

        /* ------------------ NOTIFICATION ------------------ */
        notifyCounselorAssignment({
            counselor,
            teamLeader,
            authUser
        });

        return res.status(200).json({
            success: true,
            message: "Counselor assigned successfully"
        });

    } catch (error) {
        console.error("assignCounselorToTeamLeader error:", error);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};