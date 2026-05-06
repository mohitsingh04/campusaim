import mongoose from "mongoose";
import RegularUser from "../models/regularUser.js";
import Role from "../models/role.js";
import Lead from "../models/leadsModel.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import { getDateRange } from "../helper/dateRange.js";
import { db } from '../mongoose/index.js';
import { mapRoleForApp, getDbRoleKey, getRoleId } from "../utils/roleMapper.js";

function getISOWeeksInYear(year) {
    const d = new Date(year, 11, 31);
    const week = getISOWeek(d);
    return week === 1 ? 52 : week;
}

let roleCache = null;

const getRoleMap = async () => {
    if (roleCache) return roleCache;

    const roles = await Role.find().lean();
    roleCache = {};

    roles.forEach(r => {
        roleCache[r.role.toLowerCase()] = r._id;
    });

    return roleCache;
};

// Shared Aggregation Stage
const conversationPipeline = [
    {
        $lookup: {
            from: "leadconversations",
            localField: "_id",
            foreignField: "lead_id",
            as: "conversation"
        }
    },
    {
        $addFields: {
            conversation: { $arrayElemAt: ["$conversation", 0] }
        }
    },
    {
        $addFields: {
            latestSession: { $arrayElemAt: ["$conversation.sessions", -1] }
        }
    }
];

// Role Based Dashboard Controllers
// Superadmin
export const getSuperadminDashboard = async (req, res) => {
    try {
        const { start, end } = getDateRange(req.query);
        if (!start || !end) {
            return res.status(400).json({ success: false, message: "Invalid date range" });
        }

        const authUserId = await getDataFromToken(req);

        if (!mongoose.Types.ObjectId.isValid(authUserId)) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const authUser = await RegularUser.findById(authUserId)
            .populate("role", "role")
            .select("_id role")
            .lean();

        if (!authUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const appRole = mapRoleForApp(authUser.role?.role);

        if (appRole !== "superadmin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const now = new Date();

        const roleIdMap = await getRoleMap();
        const [adminRoleId, partnerRoleId, counselorRoleId, teamLeaderRoleId] =
            await Promise.all([
                getRoleId("admin"),
                getRoleId("partner"),
                getRoleId("counselor"),
                getRoleId("teamleader"),
            ]);

        /* ---------------- PLATFORM ---------------- */
        const [
            totalAdmins,
            activeAdmins,
            newAdmins,
            unverifiedAdmins,
        ] = await Promise.all([
            RegularUser.countDocuments({ role: adminRoleId }),

            RegularUser.countDocuments({
                role: roleIdMap[getDbRoleKey("admin")],
                lastLoginAt: { $gte: start, $lte: end }
            }),

            RegularUser.countDocuments({
                role: roleIdMap[getDbRoleKey("admin")],
                createdAt: { $gte: start, $lte: end }
            }),

            RegularUser.countDocuments({
                role: roleIdMap[getDbRoleKey("admin")],
                verified: false
            }),
        ]);

        const inactiveAdmins = totalAdmins - activeAdmins;

        /* ---------------- USERS ---------------- */
        const [
            totalPartners,
            totalCounselors,
            totalTeamLeaders,
            activePartners,
            activeCounselors,
        ] = await Promise.all([
            RegularUser.countDocuments({ role: partnerRoleId }),
            RegularUser.countDocuments({ role: counselorRoleId }),
            RegularUser.countDocuments({ role: teamLeaderRoleId }),

            RegularUser.countDocuments({
                role: partnerRoleId,
                lastLoginAt: { $gte: start, $lte: end }
            }),

            RegularUser.countDocuments({
                role: counselorRoleId,
                lastLoginAt: { $gte: start, $lte: end }
            }),
        ]);

        const inactivePartners = totalPartners - activePartners;
        const inactiveCounselors = totalCounselors - activeCounselors;

        /* ---------------- LEADS ---------------- */
        const [
            totalLeads,
            newLeads,
            convertedLeads,
            contactedLeads,
            lostLeads,
            unassignedLeads,
        ] = await Promise.all([
            // total
            Lead.countDocuments({
                createdAt: { $gte: start, $lte: end }
            }),

            // new
            Lead.countDocuments({
                status: "new",
                createdAt: { $gte: start, $lte: end }
            }),

            // converted
            Lead.countDocuments({
                status: "converted",
                updatedAt: { $gte: start, $lte: end }
            }),

            // contacted
            Lead.countDocuments({
                status: "contacted",
                updatedAt: { $gte: start, $lte: end }
            }),

            // lost
            Lead.countDocuments({
                status: "lost",
                updatedAt: { $gte: start, $lte: end }
            }),

            // unassigned
            Lead.countDocuments({
                $or: [{ assignedTo: null }, { assignedTo: { $exists: false } }]
            }),
        ]);

        const conversionRate = totalLeads
            ? Number(((convertedLeads / totalLeads) * 100).toFixed(2))
            : 0;

        /* ---------------- TREND ---------------- */
        const trendRaw = await Lead.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: "Asia/Kolkata"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const map = new Map(trendRaw.map(i => [i._id, i.count]));
        const trends = [];
        const cur = new Date(start);

        while (cur <= end) {
            const d = cur.toLocaleDateString("en-CA");
            trends.push({
                date: d,
                count: map.get(d) || 0
            });
            cur.setDate(cur.getDate() + 1);
        }

        /* ---------------- RESPONSE ---------------- */
        return res.status(200).json({
            success: true,
            range: { start, end },

            platform: {
                totalAdmins,
                activeAdmins,
                inactiveAdmins,
                newAdmins,
                unverifiedAdmins,
            },

            users: {
                totalPartners,
                totalCounselors,
                totalTeamLeaders,
                activePartners,
                activeCounselors,
                inactivePartners,
                inactiveCounselors,
            },

            leads: {
                total: totalLeads,
                new: newLeads,
                converted: convertedLeads,
                contacted: contactedLeads,
                lost: lostLeads,
                conversionRate,
            },

            alerts: {
                unassignedLeads,
                inactiveAdmins,
            },

            trends,
        });

    } catch (err) {
        console.error("Dashboard error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to load dashboard",
            error: process.env.NODE_ENV === "development" ? err.message : undefined
        });
    }
};

// Admin
export const getAdminDashboard = async (req, res) => {
    try {
        const adminId = await getDataFromToken(req);

        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({ message: "Invalid admin id" });
        }

        const admin = await RegularUser.findById(adminId)
            .populate("role", "role")
            .lean();

        if (!admin) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (!admin.organizationId) {
            return res.status(400).json({ message: "Organization not found" });
        }

        const orgId = new mongoose.Types.ObjectId(admin.organizationId);

        const roleName = admin.role?.role;
        const appRole = mapRoleForApp(roleName);

        if (!["admin", "superadmin"].includes(appRole)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const [partnerRoleId, teamLeaderRoleId, counselorRoleId] = await Promise.all([
            getRoleId("partner"),
            getRoleId("teamleader"),
            getRoleId("counselor")
        ]);

        /* ---------- DATE RANGE ---------- */
        let start, end;
        try {
            ({ start, end } = getDateRange(req.query));
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

        const activeSince = new Date(); activeSince.setDate(activeSince.getDate() - 7);
        const staleThreshold = new Date(); staleThreshold.setDate(staleThreshold.getDate() - 7);

        /* ---------- PARALLEL QUERIES ---------- */
        const [
            partners, teamLeaders, counselors,
            activePartners, activeTeamLeaders, activeCounselors,
            totalLeads, newLeads, convertedLeads, contactedLeads, lostLeads,
            todayLeads,
            unassignedLeads, staleLeads,
            pipelineLeads, assignedLeads,
            followUpsTodayRaw
        ] = await Promise.all([

            /* TEAM */
            RegularUser.countDocuments({ role: partnerRoleId, organizationId: orgId }),
            RegularUser.countDocuments({ role: teamLeaderRoleId, organizationId: orgId }),
            RegularUser.countDocuments({ role: counselorRoleId, organizationId: orgId }),

            /* ACTIVE */
            RegularUser.countDocuments({
                role: partnerRoleId,
                organizationId: orgId,
                $or: [
                    { lastLoginAt: { $gte: activeSince } },
                    { updatedAt: { $gte: activeSince } }
                ]
            }),
            RegularUser.countDocuments({
                role: teamLeaderRoleId,
                organizationId: orgId,
                $or: [
                    { lastLoginAt: { $gte: activeSince } },
                    { updatedAt: { $gte: activeSince } }
                ]
            }),
            RegularUser.countDocuments({
                role: counselorRoleId,
                organizationId: orgId,
                $or: [
                    { lastLoginAt: { $gte: activeSince } },
                    { updatedAt: { $gte: activeSince } }
                ]
            }),

            /* LEADS */
            Lead.countDocuments({ createdAt: { $gte: start, $lte: end }, organizationId: orgId }),
            Lead.countDocuments({ status: "new", createdAt: { $gte: start, $lte: end }, organizationId: orgId }),
            Lead.countDocuments({ status: "converted", createdAt: { $gte: start, $lte: end }, organizationId: orgId }),
            Lead.countDocuments({ status: "contacted", createdAt: { $gte: start, $lte: end }, organizationId: orgId }),
            Lead.countDocuments({ status: "lost", createdAt: { $gte: start, $lte: end }, organizationId: orgId }),

            /* TODAY */
            Lead.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd }, organizationId: orgId }),

            /* ALERTS */
            Lead.countDocuments({
                $or: [{ assignedTo: null }, { assignedTo: { $exists: false } }],
                status: { $nin: ["converted", "contacted", "lost"] },
                organizationId: orgId
            }),

            Lead.countDocuments({
                organizationId: orgId,
                status: { $nin: ["converted", "lost"] },
                $or: [
                    { lastActivity: { $lt: staleThreshold } },
                    { lastActivity: { $exists: false } }
                ]
            }),

            /* PIPELINE */
            Lead.countDocuments({
                organizationId: orgId,
                status: { $nin: ["converted", "lost"] }
            }),

            Lead.countDocuments({
                organizationId: orgId,
                assignedTo: { $ne: null },
                createdAt: { $gte: start, $lte: end }
            }),

            /* FOLLOWUPS */
            db.collection("leadconversations").aggregate([
                { $unwind: "$sessions" },
                {
                    $match: {
                        organizationId: orgId, // 🔥 REQUIRED
                        "sessions.next_follow_up_date": {
                            $gte: todayStart,
                            $lte: todayEnd,
                        },
                        "sessions.follow_up_completed": false
                    },
                },
                {
                    $lookup: {
                        from: "leads",
                        let: { leadId: "$lead_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$leadId"] },
                                            { $eq: ["$organizationId", orgId] } // 🔥 enforce org boundary
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "lead",
                    },
                },
                { $unwind: "$lead" },
                {
                    $match: {
                        "lead.status": { $nin: ["converted", "lost"] }
                    },
                },
                { $group: { _id: "$lead_id" } },
                { $count: "count" },
            ]).toArray()
        ]);

        const followUpsToday = followUpsTodayRaw[0]?.count || 0;

        /* PERFORMANCE */
        const conversionRate = totalLeads
            ? Number(((convertedLeads / totalLeads) * 100).toFixed(2))
            : 0;

        const assignmentRate = totalLeads
            ? Number(((assignedLeads / totalLeads) * 100).toFixed(2))
            : 0;

        /* TREND */
        const trendRaw = await Lead.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end }, organizationId: orgId } },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: "Asia/Kolkata"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const map = new Map(trendRaw.map(i => [i._id, i.count]));
        const trends = [];
        const cur = new Date(start);

        while (cur <= end) {
            const d = cur.toLocaleDateString("en-CA");
            trends.push({ date: d, count: map.get(d) || 0 });
            cur.setDate(cur.getDate() + 1);
        }

        return res.status(200).json({
            success: true,
            range: { start, end },

            team: {
                partners,
                teamLeaders,
                counselors,
                activePartners,
                activeTeamLeaders,
                activeCounselors,
            },

            leads: {
                total: totalLeads,
                new: newLeads,
                addedToday: todayLeads,
                converted: convertedLeads,
                contacted: contactedLeads,
                lost: lostLeads,
                pipeline: pipelineLeads,
            },

            alerts: {
                unassignedLeads,
                staleLeads,
                followUpsToday,
            },

            performance: {
                conversionRate,
                assignmentRate,
            },

            trends,
        });

    } catch (error) {
        console.error("Admin dashboard error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// Counselor
export const getCounselorDashboard = async (req, res) => {
    try {
        const counselorId = await getDataFromToken(req);

        /* ---------------- VALIDATION ---------------- */
        if (!mongoose.Types.ObjectId.isValid(counselorId)) {
            return res.status(400).json({ message: "Invalid user token" });
        }

        /* ---------------- AUTH USER ---------------- */
        const counselor = await RegularUser.findById(counselorId)
            .populate("role", "role") // ✅ IMPORTANT
            .select("_id role organizationId")
            .lean();

        if (!counselor) {
            return res.status(404).json({ message: "User not found" });
        }

        const appRole = mapRoleForApp(counselor.role?.role); // ✅ FIX

        if (appRole !== "counselor") {
            return res.status(403).json({ message: "Access denied" });
        }

        if (!counselor.organizationId) {
            return res.status(400).json({ message: "Organization context missing" });
        }

        const orgId = new mongoose.Types.ObjectId(counselor.organizationId);
        const userId = new mongoose.Types.ObjectId(counselor._id);

        /* ---------------- DATE RANGE ---------------- */
        const { start, end } = getDateRange(req.query);

        const startOfToday = new Date(); startOfToday.setUTCHours(0, 0, 0, 0);
        const endOfToday = new Date(); endOfToday.setUTCHours(23, 59, 59, 999);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        /* ---------------- OWNERSHIP FILTER ---------------- */
        const ownershipMatch = {
            $or: [
                { assignedTo: userId },
                { createdBy: userId }
            ]
        };

        const baseFilter = {
            organizationId: orgId,
            ...ownershipMatch
        };

        const [result] = await Lead.aggregate([
            { $match: baseFilter },

            {
                $lookup: {
                    from: "leadconversations",
                    localField: "_id",
                    foreignField: "lead_id",
                    as: "conversation"
                }
            },
            {
                $addFields: {
                    lastSession: {
                        $arrayElemAt: ["$conversation.sessions", -1]
                    }
                }
            },

            {
                $facet: {
                    totalLeads: [{ $count: "count" }],

                    totalAssignedLeads: [
                        {
                            $match: {
                                assignedTo: userId,
                                createdBy: { $ne: userId }
                            }
                        },
                        { $count: "count" }
                    ],

                    totalAddedLeads: [
                        { $match: { createdBy: userId } },
                        { $count: "count" }
                    ],

                    statusFunnel: [
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 }
                            }
                        }
                    ],

                    followUpsToday: [
                        {
                            $match: {
                                status: { $nin: ["converted", "lost"] },
                                "lastSession.next_follow_up_date": {
                                    $gte: startOfToday,
                                    $lte: endOfToday
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                followUpDate: "$lastSession.next_follow_up_date",
                                followUpTime: "$lastSession.next_follow_up_time"
                            }
                        },
                        { $sort: { followUpDate: 1 } },
                        { $limit: 5 }
                    ],

                    upcomingFollowUps: [
                        {
                            $match: {
                                status: { $nin: ["converted", "lost"] },
                                "lastSession.next_follow_up_date": {
                                    $exists: true,
                                    $gt: endOfToday
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                followUpDate: "$lastSession.next_follow_up_date",
                                followUpTime: "$lastSession.next_follow_up_time"
                            }
                        },
                        { $sort: { followUpDate: 1 } },
                        { $limit: 5 }
                    ],

                    missedFollowUps: [
                        {
                            $match: {
                                status: { $nin: ["converted", "lost"] },
                                "lastSession.next_follow_up_date": { $lt: startOfToday }
                            }
                        },
                        { $count: "count" }
                    ],

                    newAssignedLeads: [
                        {
                            $match: {
                                createdAt: { $gte: yesterday }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                city: 1,
                                createdAt: 1
                            }
                        },
                        { $sort: { createdAt: -1 } },
                        { $limit: 5 }
                    ],

                    assignedLeads: [
                        { $sort: { createdAt: -1 } },
                        {
                            $project: {
                                name: 1,
                                city: 1,
                                status: 1,
                                createdAt: 1
                            }
                        },
                        { $limit: 5 }
                    ],

                    activities: [
                        { $sort: { updatedAt: -1 } },
                        {
                            $project: {
                                message: {
                                    $concat: [
                                        "Lead ",
                                        { $ifNull: ["$name", ""] },
                                        " updated"
                                    ]
                                },
                                time: "$updatedAt"
                            }
                        },
                        { $limit: 5 }
                    ],

                    staleLeads: [
                        {
                            $match: {
                                ...ownershipMatch,
                                status: { $nin: ["converted", "lost"] },
                                lastActivity: { $lt: start }
                            }
                        },
                        { $count: "count" }
                    ],

                    convertedLeads: [
                        {
                            $match: {
                                ...ownershipMatch,
                                status: "converted",
                                updatedAt: { $gte: start, $lte: end }
                            }
                        },
                        { $count: "count" }
                    ],

                    contactedLeads: [
                        {
                            $match: {
                                ...ownershipMatch,
                                status: "contacted",
                                updatedAt: { $gte: start, $lte: end }
                            }
                        },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        /* ---------------- RESPONSE ---------------- */
        const totalLeads = result?.totalLeads?.[0]?.count || 0;
        const totalAssignedLeads = result?.totalAssignedLeads?.[0]?.count || 0;
        const totalAddedLeads = result?.totalAddedLeads?.[0]?.count || 0;

        const missedFollowUps = result?.missedFollowUps?.[0]?.count || 0;
        const staleLeads = result?.staleLeads?.[0]?.count || 0;
        const convertedLeads = result?.convertedLeads?.[0]?.count || 0;

        const funnelMap = { new: 0, contacted: 0, converted: 0, lost: 0 };

        (result?.statusFunnel || []).forEach((s) => {
            if (funnelMap[s._id] !== undefined) {
                funnelMap[s._id] = s.count;
            }
        });

        const conversionRate = totalLeads
            ? Number(((convertedLeads / totalLeads) * 100).toFixed(2))
            : 0;

        return res.status(200).json({
            success: true,
            totalLeads,
            totalAssignedLeads,
            totalAddedLeads,
            followUpsToday: result?.followUpsToday || [],
            upcomingFollowUps: result?.upcomingFollowUps || [],
            newAssignedLeads: result?.newAssignedLeads || [],
            assignedLeads: result?.assignedLeads || [],
            activities: result?.activities || [],
            statusFunnel: funnelMap,
            alerts: {
                missedFollowUps,
                staleLeads
            },
            performance: {
                callsToday: result?.followUpsToday?.length || 0,
                conversionRate,
                missedFollowUps
            }
        });

    } catch (error) {
        console.error("Counselor dashboard error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Partner
export const getPartnerDashboard = async (req, res) => {
    try {
        const partnerId = await getDataFromToken(req);

        /* ---------------- VALIDATION ---------------- */
        if (!mongoose.Types.ObjectId.isValid(partnerId)) {
            return res.status(400).json({ message: "Invalid user token" });
        }

        /* ---------------- AUTH USER ---------------- */

        const partner = await RegularUser.findById(partnerId)
            .populate("role", "role") // ✅ IMPORTANT
            .select("_id role organizationId")
            .lean();

        if (!partner) {
            return res.status(404).json({ message: "User not found" });
        }

        const appRole = mapRoleForApp(partner.role?.role); // ✅ FIX

        if (appRole !== "partner") {
            return res.status(403).json({ message: "Access denied" });
        }

        if (!partner.organizationId) {
            return res.status(400).json({ message: "Organization context missing" });
        }

        const orgId = new mongoose.Types.ObjectId(partner.organizationId);
        const userId = new mongoose.Types.ObjectId(partner._id);

        const { start, end } = getDateRange(req.query);

        /* ---------------- BASE FILTER ---------------- */
        const baseFilter = {
            organizationId: orgId,
            leadType: "partner",
            createdBy: userId // ✅ ownership only
        };

        const rangeFilter = {
            ...baseFilter,
            createdAt: { $gte: start, $lte: end },
        };

        /* ---------------- PARALLEL QUERIES ---------------- */
        const [
            totalLeads,
            convertedLeads,
            lostLeads,
            recentLeads,
            monthlyTrend,
            cityBreakdown,
        ] = await Promise.all([

            Lead.countDocuments(rangeFilter),

            Lead.countDocuments({
                ...baseFilter,
                status: "converted",
                updatedAt: { $gte: start, $lte: end },
            }),

            Lead.countDocuments({
                ...baseFilter,
                status: "lost",
                updatedAt: { $gte: start, $lte: end },
            }),

            Lead.find(rangeFilter)
                .select("name contact email city status createdAt")
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),

            Lead.aggregate([
                {
                    $match: {
                        ...baseFilter,
                        createdAt: {
                            $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)),
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                        },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
            ]),

            Lead.aggregate([
                {
                    $match: {
                        ...rangeFilter,
                        city: { $ne: null },
                    },
                },
                {
                    $group: {
                        _id: "$city",
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),
        ]);

        /* ---------------- METRICS ---------------- */
        const conversionRate = totalLeads
            ? Number(((convertedLeads / totalLeads) * 100).toFixed(2))
            : 0;

        /* ---------------- RESPONSE ---------------- */
        return res.status(200).json({
            stats: {
                totalLeads,
                convertedLeads,
                lostLeads,
                conversionRate,
            },
            recentLeads,
            analytics: {
                monthlyTrend: monthlyTrend.map((m) => ({
                    month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
                    count: m.count,
                })),
                topCities: cityBreakdown.map((c) => ({
                    city: c._id || "Unknown",
                    count: c.count,
                })),
            },
        });

    } catch (error) {
        console.error("Partner dashboard error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Team Leader
export const getTeamLeaderDashboard = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

        const teamLeaderId = await getDataFromToken(req);

        if (!mongoose.Types.ObjectId.isValid(teamLeaderId)) {
            return res.status(400).json({ message: "Invalid user token" });
        }

        const teamleader = await RegularUser.findById(teamLeaderId)
            .populate("role", "role")
            .select("_id role organizationId")
            .lean();

        if (!teamleader) {
            return res.status(404).json({ message: "User not found" });
        }

        const appRole = mapRoleForApp(teamleader.role?.role);

        if (appRole !== "teamleader") {
            return res.status(403).json({ message: "Access denied" });
        }

        if (!teamleader.organizationId) {
            return res.status(400).json({ message: "Organization missing" });
        }

        const orgId = new mongoose.Types.ObjectId(teamleader.organizationId);
        const tlId = new mongoose.Types.ObjectId(teamleader._id);

        const { start, end, groupBy = "month" } = {
            ...getDateRange(req.query),
            groupBy: req.query.groupBy || "month",
        };

        if (!start || !end) {
            return res.status(400).json({ message: "Invalid date range" });
        }

        /* ---------------- Counselors ---------------- */
        const counselorRoleId = await getRoleId("counselor");

        const counselors = await RegularUser.find({
            organizationId: orgId,
            role: counselorRoleId,
            teamLeader: tlId,
        })
            .select("_id name")
            .lean();

        const counselorIds = counselors.map(c => c._id);
        const safeCounselorIds = counselorIds.length ? counselorIds : [null];

        /* ---------------- Base Filter ---------------- */
        const baseFilter = {
            organizationId: orgId,
            $or: [
                { assignedTo: tlId },
                { createdBy: tlId },
                { assignedTo: { $in: counselorIds } },
                { createdBy: { $in: counselorIds } }
            ]
        };

        const teamRangeFilter = {
            ...baseFilter,
            createdAt: { $gte: start, $lte: end },
        };

        const myRangeFilter = {
            createdBy: tlId,
            createdAt: { $gte: start, $lte: end },
        };

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        /* ---------------- Trend ---------------- */
        const trendAggregation =
            groupBy === "week"
                ? [
                    { $match: teamRangeFilter },
                    {
                        $group: {
                            _id: {
                                year: { $isoWeekYear: "$createdAt" },
                                week: { $isoWeek: "$createdAt" },
                            },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { "_id.year": 1, "_id.week": 1 } },
                ]
                : [
                    {
                        $match: {
                            ...baseFilter,
                            createdAt: { $gte: yearStart, $lte: yearEnd },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" },
                            },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } },
                ];

        /* ---------------- Queries ---------------- */
        const [
            totalTeamLeads,
            myLeads,
            assignedToday,
            recentLeads,
            funnelStats,
            trendData,
            counselorPerformance,
        ] = await Promise.all([

            Lead.countDocuments(teamRangeFilter),

            Lead.countDocuments(myRangeFilter),

            Lead.countDocuments({
                assignedAt: { $gte: todayStart, $lte: new Date() },
                $or: [
                    { assignedTo: tlId },
                    { createdBy: tlId },
                    { assignedTo: { $in: safeCounselorIds } },
                ],
            }),

            Lead.find(teamRangeFilter)
                .select("name contact email city status createdAt")
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),

            Lead.aggregate([
                { $match: teamRangeFilter },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ]),

            Lead.aggregate(trendAggregation),

            Lead.aggregate([
                {
                    $match: {
                        assignedTo: { $in: counselorIds },
                        createdAt: { $gte: start, $lte: end },
                    },
                },
                {
                    $group: {
                        _id: "$assignedTo",
                        totalLeads: { $sum: 1 },
                        converted: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "converted"] }, 1, 0],
                            },
                        },
                    },
                },
            ]),
        ]);

        /* ---------------- Funnel ---------------- */
        const funnelMap = new Map(funnelStats.map(f => [f._id, f.count]));

        const funnel = {
            new: funnelMap.get("new") || 0,
            converted: funnelMap.get("converted") || 0,
            lost: funnelMap.get("lost") || 0,
        };

        const totalLeads = Array.from(funnelMap.values()).reduce((a, b) => a + b, 0);

        const conversionRate = totalLeads
            ? Number(((funnel.converted / totalLeads) * 100).toFixed(2))
            : 0;

        /* ---------------- Trend Fill ---------------- */
        let filledTrend = [];

        if (groupBy === "week") {
            filledTrend = trendData.map(t => ({
                period: `${t._id.year}-W${String(t._id.week).padStart(2, "0")}`,
                count: t.count,
            }));
        } else {
            for (let i = 0; i < 12; i++) {
                const key = `${currentYear}-${String(i + 1).padStart(2, "0")}`;

                const found = trendData.find(
                    t => t._id.year === currentYear && t._id.month === i + 1
                );

                filledTrend.push({
                    period: key,
                    count: found?.count || 0,
                });
            }
        }

        /* ---------------- Counselor Stats ---------------- */
        const perfMap = new Map(
            counselorPerformance.map(c => [String(c._id), c])
        );

        const counselorsWithStats = counselors.map(c => {
            const stats = perfMap.get(String(c._id)) || {};
            const total = stats.totalLeads || 0;
            const converted = stats.converted || 0;

            return {
                _id: c._id,
                name: c.name,
                totalLeads: total,
                converted,
                conversionRate: total
                    ? Number(((converted / total) * 100).toFixed(2))
                    : 0,
            };
        });

        return res.status(200).json({
            stats: {
                totalTeamLeads,
                myLeads,
                assignedToday,
                activeCounselors: counselors.length,
                conversionRate,
            },
            funnel,
            recentLeads,
            counselors: counselorsWithStats,
            analytics: {
                trend: filledTrend,
                groupBy,
            },
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Role Based Analytics Controllers
// Admin
export const getAdminAnalytics = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid admin ID" });
        }

        const admin = await RegularUser.findById(id)
            .populate("role", "role")
            .select("_id role organizationId")
            .lean();

        if (!admin || mapRoleForApp(admin.role?.role) !== "admin") {
            return res.status(404).json({ error: "Admin not found" });
        }

        const orgId = admin.organizationId;

        /* ---------------- ROLE IDS (HIGH PERFORMANCE) ---------------- */
        const [partnerRoleId, counselorRoleId] = await Promise.all([
            getRoleId("partner"),
            getRoleId("counselor")
        ]);

        /* ---------------- PEOPLE METRICS ---------------- */
        const [partnerStats, counselorStats] = await Promise.all([
            RegularUser.aggregate([
                { $match: { role: partnerRoleId, organizationId: orgId } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        active: {
                            $sum: {
                                $cond: [{ $eq: ["$status", true] }, 1, 0]
                            }
                        }
                    }
                }
            ]),
            RegularUser.aggregate([
                { $match: { role: counselorRoleId, organizationId: orgId } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        active: {
                            $sum: {
                                $cond: [{ $eq: ["$status", true] }, 1, 0]
                            }
                        }
                    }
                }
            ])
        ]);

        /* ---------------- LEAD METRICS ---------------- */
        const now = new Date();
        const last7Days = new Date(now);
        last7Days.setDate(now.getDate() - 7);

        const leadStats = await Lead.aggregate([
            { $match: { organizationId: orgId } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    assigned: {
                        $sum: {
                            $cond: [{ $ifNull: ["$assignedTo", false] }, 1, 0]
                        }
                    },
                    unassigned: {
                        $sum: {
                            $cond: [{ $ifNull: ["$assignedTo", false] }, 0, 1]
                        }
                    },
                    converted: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "converted"] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const newLeadsLast7Days = await Lead.countDocuments({
            organizationId: orgId,
            createdAt: { $gte: last7Days }
        });

        /* ---------------- TREND ---------------- */
        const dailyLeads = await Lead.aggregate([
            {
                $match: {
                    organizationId: orgId,
                    createdAt: { $gte: last7Days }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        /* ---------------- SAFE FALLBACKS ---------------- */

        const partners = partnerStats[0] || { total: 0, active: 0 };
        const counselors = counselorStats[0] || { total: 0, active: 0 };
        const leads = leadStats[0] || {
            total: 0,
            assigned: 0,
            unassigned: 0,
            converted: 0
        };

        const conversionRate = leads.total
            ? Number(((leads.converted / leads.total) * 100).toFixed(2))
            : 0;

        /* ---------------- RESPONSE ---------------- */

        return res.status(200).json({
            people: {
                partners: {
                    total: partners.total,
                    active: partners.active,
                    inactive: partners.total - partners.active
                },
                counselors: {
                    total: counselors.total,
                    active: counselors.active,
                    inactive: counselors.total - counselors.active
                }
            },
            leads: {
                total: leads.total,
                newLast7Days: newLeadsLast7Days,
                assigned: leads.assigned,
                unassigned: leads.unassigned,
                converted: leads.converted,
                conversionRate
            },
            trends: {
                dailyLeads: dailyLeads.map(d => ({
                    date: d._id,
                    count: d.count
                }))
            }
        });

    } catch (error) {
        console.error("Admin analytics error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Team Leader
export const getTeamLeaderAnalytics = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);
        const { teamLeaderId } = req.params;

        // ===== AUTH USER =====
        if (!mongoose.Types.ObjectId.isValid(authUserId)) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }

        const authUser = await RegularUser.findById(authUserId)
            .populate("role", "role")
            .select("_id role")
            .lean();

        if (!authUser) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }

        const authAppRole = mapRoleForApp(authUser.role?.role); // ✅ FIX

        let targetTeamLeaderId;

        /* ================= ROLE RESOLUTION ================= */

        if (authAppRole === "teamleader") {
            targetTeamLeaderId = authUser._id;
        }
        else if (authAppRole === "admin") {
            if (!mongoose.Types.ObjectId.isValid(teamLeaderId)) {
                return res.status(400).json({
                    success: false,
                    error: "Valid TeamLeader ID required"
                });
            }

            const tl = await RegularUser.findById(teamLeaderId)
                .populate("role", "role")
                .select("_id role")
                .lean();

            if (!tl || mapRoleForApp(tl.role?.role) !== "teamleader") {
                return res.status(404).json({
                    success: false,
                    error: "TeamLeader not found"
                });
            }

            targetTeamLeaderId = tl._id;
        }
        else {
            return res.status(403).json({
                success: false,
                error: "Access denied"
            });
        }

        /* ================= ROLE IDS (FAST QUERY) ================= */

        const counselorRoleId = await getRoleId("counselor");

        /* ================= COUNSELORS ================= */

        const counselors = await RegularUser.find({
            role: counselorRoleId,
            teamLeader: targetTeamLeaderId
        })
            .select("_id")
            .lean();

        const counselorIds = counselors.map(c => c._id);

        if (!counselorIds.length) {
            return res.json({
                teamLeaderId: targetTeamLeaderId,
                summary: {
                    totalCounselors: 0,
                    totalLeads: 0,
                    convertedLeads: 0
                }
            });
        }

        /* ================= LEADS ================= */

        const [leadStats] = await Lead.aggregate([
            {
                $match: {
                    assignedTo: { $in: counselorIds }
                }
            },
            {
                $group: {
                    _id: null,
                    totalLeads: { $sum: 1 },
                    convertedLeads: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "converted"] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        /* ================= RESPONSE ================= */

        return res.json({
            teamLeaderId: targetTeamLeaderId,
            summary: {
                totalCounselors: counselorIds.length,
                totalLeads: leadStats?.totalLeads || 0,
                convertedLeads: leadStats?.convertedLeads || 0
            }
        });

    } catch (error) {
        console.error("TeamLeader Analytics Error:", error);

        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

// Partner
export const getPartnerAnalytics = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);
        const { partnerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(authUserId)) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // 🔎 Auth user
        const authUser = await RegularUser.findById(authUserId)
            .populate("role", "role")
            .select("_id role")
            .lean();

        if (!authUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const authAppRole = mapRoleForApp(authUser.role?.role); // ✅ FIX

        let targetPartnerId;

        /* ---------- Role Resolution ---------- */

        if (authAppRole === "partner") {
            targetPartnerId = authUser._id;
        }
        else if (authAppRole === "admin") {
            if (!mongoose.Types.ObjectId.isValid(partnerId)) {
                return res.status(400).json({ error: "Valid Partner ID required" });
            }
            targetPartnerId = partnerId;
        }
        else {
            return res.status(403).json({ error: "Access denied" });
        }

        /* ---------- Aggregate Leads ---------- */

        const leadStats = await Lead.aggregate([
            {
                $match: {
                    partner: new mongoose.Types.ObjectId(targetPartnerId)
                }
            },

            ...conversationPipeline,

            {
                $group: {
                    _id: "$assignedTo",
                    totalLeads: { $sum: 1 },
                    convertedLeads: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "converted"] }, 1, 0]
                        }
                    },
                    avgProbability: {
                        $avg: {
                            $ifNull: ["$latestSession.overallLeadScore", 0]
                        }
                    }
                }
            },

            // ✅ FIX: correct collection name
            {
                $lookup: {
                    from: "regularusers",
                    localField: "_id",
                    foreignField: "_id",
                    as: "counselor"
                }
            },

            { $unwind: "$counselor" },

            // ✅ Optional: project only needed fields
            {
                $project: {
                    _id: 1,
                    totalLeads: 1,
                    convertedLeads: 1,
                    avgProbability: 1,
                    "counselor.name": 1
                }
            }
        ]);

        /* ---------- Counselor Stats ---------- */

        const counselors = leadStats.map((c) => {
            const total = c.totalLeads || 0;
            const converted = c.convertedLeads || 0;

            return {
                _id: c._id,
                name: c.counselor?.name || "Unknown",
                totalLeads: total,
                convertedLeads: converted,
                conversionRate: total
                    ? Number(((converted / total) * 100).toFixed(1))
                    : 0,
                avgProbability: Number((c.avgProbability || 0).toFixed(1)),
            };
        });

        /* ---------- Summary ---------- */

        const summary = counselors.reduce(
            (acc, c) => {
                acc.totalLeads += c.totalLeads;
                acc.convertedLeads += c.convertedLeads;
                acc.totalProbability += c.avgProbability;
                return acc;
            },
            {
                totalLeads: 0,
                convertedLeads: 0,
                totalProbability: 0,
            }
        );

        summary.totalCounselors = counselors.length;

        summary.avgProbability = counselors.length
            ? Number((summary.totalProbability / counselors.length).toFixed(1))
            : 0;

        summary.expectedConversions = Math.round(
            summary.totalLeads * (summary.avgProbability / 100)
        );

        delete summary.totalProbability;

        return res.json({
            partnerId: targetPartnerId,
            summary,
            counselors,
        });

    } catch (error) {
        console.error("Partner Analytics Error:", error);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

// Counselor
export const getCounselorAnalytics = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);
        const { counselorId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(authUserId)) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // 🔎 Auth user
        const authUser = await RegularUser.findById(authUserId)
            .populate("role", "role")
            .select("_id role")
            .lean();

        if (!authUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const authAppRole = mapRoleForApp(authUser.role?.role); // ✅ FIX

        let targetCounselorId;

        /* ---------- ROLE RESOLUTION ---------- */

        if (authAppRole === "counselor") {
            targetCounselorId = authUser._id;
        }
        else if (["admin", "teamleader"].includes(authAppRole)) {
            if (!mongoose.Types.ObjectId.isValid(counselorId)) {
                return res.status(400).json({ error: "Valid Counselor ID required" });
            }
            targetCounselorId = counselorId;
        }
        else {
            return res.status(403).json({ error: "Access denied" });
        }

        const counselorObjectId = new mongoose.Types.ObjectId(targetCounselorId);

        /* ---------- CONTACT-BASED AGGREGATION ---------- */

        const statsAgg = await Lead.aggregate([
            {
                $addFields: {
                    contactHistorySafe: {
                        $cond: [
                            { $isArray: "$contactHistory" },
                            "$contactHistory",
                            []
                        ]
                    }
                }
            },
            {
                $addFields: {
                    counselorContacts: {
                        $filter: {
                            input: "$contactHistorySafe",
                            as: "c",
                            cond: {
                                $eq: ["$$c.contactedBy", counselorObjectId]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    contactedByCounselor: {
                        $gt: [{ $size: "$counselorContacts" }, 0]
                    }
                }
            },
            {
                $group: {
                    _id: null,

                    totalLeads: {
                        $sum: {
                            $cond: ["$contactedByCounselor", 1, 0]
                        }
                    },

                    totalContacts: {
                        $sum: { $size: "$counselorContacts" }
                    },

                    convertedLeads: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$status", "converted"] },
                                        "$contactedByCounselor"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const stats = statsAgg[0] || {};

        const totalLeads = stats.totalLeads || 0;
        const totalContacts = stats.totalContacts || 0;
        const convertedLeads = stats.convertedLeads || 0;

        const conversionRate = totalLeads
            ? Number(((convertedLeads / totalLeads) * 100).toFixed(1))
            : 0;

        return res.json({
            counselorId: targetCounselorId,
            summary: {
                totalLeads,
                totalContacts,
                convertedLeads,
                conversionRate
            }
        });

    } catch (error) {
        console.error("Counselor Analytics Error:", error);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};