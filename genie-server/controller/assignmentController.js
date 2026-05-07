import mongoose from "mongoose";
import RegularUser from "../models/regularUser.js";
import Lead from "../models/leadsModel.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import { notifyCounselorAssignment, notifyLeadAssignment } from "../helper/notification/notificationHelper.js";
import { mapRoleForApp } from "../utils/roleMapper.js";

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

        const authUser = await RegularUser
            .findById(authUserId)
            .select("_id name role")
            .populate("role", "role");

        const assignToUser = await RegularUser
            .findById(assignToId)
            .select("_id role teamLeader")
            .populate("role", "role");

        if (!authUser || !assignToUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const authUserRole = mapRoleForApp(authUser.role?.role);
        const assignToRole = mapRoleForApp(assignToUser.role?.role);

        /* ================= ADMIN LOGIC ================= */
        if (authUserRole === "admin") {

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
            if (assignToRole === "teamleader") {

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

            if (assignToRole === "counselor") {
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
                organizationId: assignToUser.organizationId || null,
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
                organizationId: assignToUser.organizationId || null,
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

        // 🔎 Fetch counselors under this team leader
        const counselors = await RegularUser.find({ teamLeader: teamLeaderId })
            .populate("role", "role")
            .select("_id name email mobile_no status role");

        // 🔐 Filter only counselors (since role is ObjectId now)
        const filteredCounselors = counselors.filter(
            (c) => mapRoleForApp(c.role?.role) === "counselor"
        );

        const counselorIds = filteredCounselors.map(c => c._id);

        // ⚠️ Edge case: no counselors
        if (!counselorIds.length) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: []
            });
        }

        // 🔎 Aggregate lead count
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

        // 🔁 Convert to map
        const leadCountMap = {};
        leadCounts.forEach(l => {
            if (l._id) {
                leadCountMap[l._id.toString()] = l.count;
            }
        });

        // 🔄 Attach leadCount
        const response = filteredCounselors.map(c => ({
            _id: c._id,
            name: c.name,
            email: c.email,
            mobile_no: c.mobile_no,
            status: c.status,
            leadCount: leadCountMap[c._id.toString()] || 0
        }));

        return res.status(200).json({
            success: true,
            count: response.length,
            data: response
        });

    } catch (err) {
        console.error("getAssignedCounselors error:", err);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const assignCounselorToTeamLeader = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);

        if (!mongoose.Types.ObjectId.isValid(authUserId)) {
            return res.status(401).json({ error: "Invalid token" });
        }

        const authUser = await RegularUser.findById(authUserId)
            .populate("role", "role")
            .lean();

        if (!authUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const appRole = mapRoleForApp(authUser.role?.role);

        // 🔐 RBAC
        if (!["admin"].includes(appRole)) {
            return res.status(403).json({ error: "Permission denied" });
        }

        const { counselorId } = req.params;
        const { teamLeaderId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(counselorId)) {
            return res.status(400).json({ error: "Invalid counselor ID" });
        }

        // 🔎 Counselor
        const counselor = await RegularUser.findById(counselorId)
            .populate("role", "role")
            .select("_id name teamLeader role");

        const counselorRole = mapRoleForApp(counselor?.role?.role);

        if (!counselor || counselorRole !== "counselor") {
            return res.status(404).json({ error: "Counselor not found" });
        }

        /* ---------------- UNASSIGN ---------------- */
        if (!teamLeaderId) {
            if (!counselor.teamLeader) {
                return res.status(200).json({
                    success: true,
                    message: "Counselor already unassigned",
                });
            }

            counselor.teamLeader = null;
            await counselor.save();

            return res.status(200).json({
                success: true,
                message: "Counselor unassigned successfully",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(teamLeaderId)) {
            return res.status(400).json({ error: "Invalid teamLeader ID" });
        }

        if (counselorId === teamLeaderId) {
            return res.status(400).json({
                error: "Counselor cannot be their own team leader",
            });
        }

        // 🔎 Team Leader
        const teamLeader = await RegularUser.findById(teamLeaderId)
            .populate("role", "role")
            .select("_id name role");

        const teamLeaderRole = mapRoleForApp(teamLeader?.role?.role);

        // ✅ FIXED HERE
        if (!teamLeader || teamLeaderRole !== "teamleader") {
            return res.status(404).json({ error: "Team leader not found" });
        }

        // 🔁 Already assigned
        if (counselor.teamLeader?.equals(teamLeader._id)) {
            return res.status(200).json({
                success: true,
                message: "Counselor already assigned to this team leader",
            });
        }

        // ✅ Assign
        counselor.teamLeader = teamLeader._id;
        await counselor.save();

        /* ---------------- NOTIFICATION ---------------- */
        try {
            await notifyCounselorAssignment({
                organizationId: authUser.organizationId,
                counselor,
                teamLeader,
                authUser,
            });
        } catch (err) {
            console.error("Notification error:", err);
        }

        return res.status(200).json({
            success: true,
            message: "Counselor assigned successfully",
        });

    } catch (error) {
        console.error("assignCounselorToTeamLeader error:", error);

        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
};