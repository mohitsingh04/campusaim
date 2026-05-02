import mongoose from "mongoose";
import Lead from "../models/leadsModel.js";
import RegularUser from "../models/regularUser.js";
import { getRoleMap, mapRoleForApp, getDbRoleKey, getRoleId } from "../utils/roleMapper.js";
import LeadConversation from "../models/leadConversation.js";
import { calculateFinalLeadScore } from "../utils/leadScore.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import { buildLeadScoreExplanation } from "../utils/leadScoreExplanation.js";
import { createNotification } from "../services/notification.service.js";
import { updateGoalProgress } from "../utils/updateGoalProgress.js";

const sanitizeArray = (arr, max = 80) =>
    Array.isArray(arr)
        ? arr
            .map((v) => String(v).trim().slice(0, max))
            .filter(Boolean)
        : [];

const sanitizeString = (val = "", max = 1000) =>
    String(val || "").trim().slice(0, max);

const allowedNextActions = [
    "call_again",
    "send_whatsapp",
    "schedule_visit",
    "closed",
];

export const addOrUpdateLeadConversation = async (req, res) => {
    try {
        // ---------------- AUTH ----------------
        const userId = await getDataFromToken(req);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid userId." });
        }

        const user = await RegularUser.findById(userId)
            .populate("role", "role")
            .select("_id name role")
            .lean();

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const appRole = mapRoleForApp(user.role?.role); // ✅ FIX

        // ---------------- BODY ----------------
        const {
            lead_id,
            questions = [],
            status = "open",
            message = "",
            rating = 0,
            submitQuestion,
            next_follow_up_date,
            next_follow_up_time,
            pitchSummary = "",
            callNotes = "",
            studentObjections = [],
            collegesSuggested = [],
            courseSuggested = [],
            nextAction = "call_again"
        } = req.body;

        // ---------------- VALIDATION ----------------
        if (!mongoose.Types.ObjectId.isValid(lead_id)) {
            return res.status(400).json({ error: "Invalid lead_id." });
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: "Questions are required." });
        }

        // ---------------- FOLLOW-UP VALIDATION ----------------
        let followUpDate = null;

        if (next_follow_up_date) {
            followUpDate = new Date(next_follow_up_date);

            if (isNaN(followUpDate.getTime())) {
                return res.status(400).json({ error: "Invalid follow-up date." });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (followUpDate < today) {
                return res.status(400).json({
                    error: "Follow-up cannot be in past."
                });
            }
        }

        // ---------------- FETCH LEAD ----------------
        const lead = await Lead.findById(lead_id).select("_id name assignedTo teamLeader status");

        if (!lead) {
            return res.status(404).json({ error: "Lead not found." });
        }

        const isAdmin = ["admin", "superadmin"].includes(appRole);

        const isAssigned =
            lead.assignedTo?.toString() === userId.toString();

        const isTeamLeader =
            appRole === "teamleader" &&
            lead.teamLeader?.toString() === userId.toString();

        if (!isAdmin && !isAssigned && !isTeamLeader) {
            return res.status(403).json({
                error: "You are not allowed to update this lead"
            });
        }

        // ---------------- RECIPIENT COLLECTION ----------------
        const recipients = new Set();

        if (lead.assignedTo) recipients.add(lead.assignedTo.toString());
        if (lead.teamLeader) recipients.add(lead.teamLeader.toString());

        const adminRoleIds = await Promise.all([
            getRoleId("admin"),
            getRoleId("superadmin")
        ]);

        const admins = await RegularUser.find({ role: { $in: adminRoleIds } }).select("_id").lean();

        admins.forEach(a => recipients.add(a._id.toString()));

        recipients.delete(userId.toString());
        const recipientIds = [...recipients];

        // ---------------- SANITIZE INPUT ----------------
        const safePitchSummary = sanitizeString(pitchSummary, 1500);
        const safeCallNotes = sanitizeString(callNotes, 5000);
        const safeCourseSuggested = sanitizeArray(courseSuggested, 120);
        const safeStudentObjections = sanitizeArray(studentObjections, 120);
        const safeCollegesSuggested = sanitizeArray(collegesSuggested, 120);

        const safeNextAction = allowedNextActions.includes(nextAction)
            ? nextAction
            : "call_again";

        // ---------------- SANITIZE QUESTIONS ----------------
        const sanitizedQuestions = questions.map(q => {
            if (!mongoose.Types.ObjectId.isValid(q.question_id)) {
                throw new Error("Invalid question_id detected.");
            }

            return {
                question_id: new mongoose.Types.ObjectId(q.question_id),
                answer: sanitizeString(q.answer, 300),
                point: [-1, 0, 1].includes(Number(q.point))
                    ? Number(q.point)
                    : 0
            };
        });

        // ---------------- DUPLICATE QUESTION GUARD ----------------
        const qIds = sanitizedQuestions.map(q => q.question_id.toString());
        if (qIds.length !== new Set(qIds).size) {
            return res.status(400).json({
                error: "Duplicate questions not allowed."
            });
        }

        // ---------------- FETCH PREVIOUS SESSIONS ----------------
        const existingConversation = await LeadConversation
            .findOne({ lead_id })
            .lean();

        const previousSessions = existingConversation?.sessions || [];

        // ---------------- DUPLICATE SUBMISSION GUARD ----------------
        if (previousSessions.length) {
            const last = previousSessions.at(-1);

            if (
                last?.createdBy?.toString() === userId.toString() &&
                last?.status === status &&
                Date.now() - new Date(last.createdAt).getTime() < 5000
            ) {
                return res.status(409).json({
                    error: "Duplicate submission detected. Please wait."
                });
            }
        }

        // ---------------- AI SCORING ----------------
        const {
            intentScore,
            engagementScore,
            counselorConfidence,
            finalScore
        } = calculateFinalLeadScore({
            questions: sanitizedQuestions,
            rating,
            sessions: previousSessions,
            next_follow_up_date: followUpDate
        });

        const lastPendingSession = await LeadConversation.findOne(
            {
                lead_id,
                "sessions.next_follow_up_date": { $ne: null }
            },
            { sessions: { $slice: -1 } }
        ).lean();

        if (
            lastPendingSession?.sessions?.length &&
            lastPendingSession.sessions[0].next_follow_up_date &&
            !lastPendingSession.sessions[0].follow_up_completed
        ) {
            await LeadConversation.updateOne(
                {
                    lead_id,
                    "sessions._id": lastPendingSession.sessions[0]._id
                },
                {
                    $set: {
                        "sessions.$.follow_up_completed": true,
                        "sessions.$.follow_up_completed_at": new Date(),
                        "sessions.$.follow_up_completed_by": userId
                    }
                }
            );
        }

        // ---------------- SAVE SESSION ----------------
        const conversation = await LeadConversation.findOneAndUpdate(
            { lead_id },
            {
                $push: {
                    sessions: {
                        createdBy: userId,
                        // role: user.role || "counselor",
                        role: appRole,
                        questions: sanitizedQuestions,
                        status,
                        message: sanitizeString(message || "", 1000),
                        rating: Math.max(0, Math.min(5, Number(rating) || 0)),

                        next_follow_up_date: followUpDate,
                        next_follow_up_time: sanitizeString(next_follow_up_time, 20),

                        follow_up_created_by: userId,

                        submitQuestion,
                        overallAnswerScore: intentScore,
                        systemLeadScore: engagementScore,
                        counselorConfidenceScore: counselorConfidence,
                        overallLeadScore: finalScore,

                        pitchSummary: safePitchSummary,
                        callNotes: safeCallNotes,
                        studentObjections: safeStudentObjections,
                        collegesSuggested: safeCollegesSuggested,
                        courseSuggested: safeCourseSuggested,
                        nextAction: safeNextAction
                    }
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }).lean();

        // ---------------- UPDATE LEAD SNAPSHOT ----------------
        if (followUpDate) {
            await Lead.findByIdAndUpdate(lead._id, {
                $set: {
                    nextFollowUp: {
                        date: followUpDate,
                        time: sanitizeString(next_follow_up_time, 20)
                    }
                }
            });

            await updateGoalProgress(userId, "followups_completed");
        }

        // ---------------- STATUS UPDATE ----------------
        // ALWAYS track lead contact attempt
        await updateGoalProgress(userId, "leads_contacted");

        // THEN update status if needed
        await Lead.findOneAndUpdate(
            { _id: lead._id, status: "new" },
            {
                $set: {
                    status: "contacted",
                    firstContactedAt: new Date()
                }
            }
        );
        await Lead.findByIdAndUpdate(lead._id, {
            $push: {
                contactHistory: {
                    contactedBy: userId,
                    contactedAt: new Date(),
                    mode: "call", // or dynamic from req.body
                    note: sanitizeString(callNotes, 500)
                }
            }
        });

        // ---------------- NOTIFICATIONS ----------------
        if (recipientIds.length) {
            const payloads = recipientIds.map(uid =>
                createNotification({
                    receiverId: uid,
                    senderId: userId,
                    type: "lead_activity",
                    title: "Lead Conversation Updated",
                    message: `${user.name} (${appRole}) updated conversation with ${lead.name}`,
                    link: `/dashboard/leads/view/${lead._id}`,
                    meta: { leadId: lead._id }
                })
            );

            await Promise.all(payloads);
        }

        // ---------------- RESPONSE ----------------
        return res.status(200).json({
            message: "Conversation saved.",
            scores: {
                intentScore,
                engagementScore,
                counselorConfidence,
                finalScore
            },
            data: conversation
        });

    } catch (error) {
        console.error("Add/Update Conversation Error:", error);

        return res.status(500).json({
            error: error.message || "Internal Server Error."
        });
    }
};

export const getAllLeadConversations = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        /* ---------------- AUTH ---------------- */

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await RegularUser.findById(userId)
            .populate("role", "role")
            .select("_id role")
            .lean();

        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const appRole = mapRoleForApp(user.role?.role);

        /* ---------------- ROLE FILTER ---------------- */

        let leadFilter = {};

        if (appRole === "teamleader") {
            const counselorRoleId = await getRoleId("counselor");

            const counselors = await RegularUser.find({
                role: counselorRoleId,
                teamLeader: user._id
            }).select("_id").lean();

            const counselorIds = counselors.map(c => c._id);

            leadFilter = {
                $or: [
                    { assignedTo: user._id },
                    { assignedTo: { $in: counselorIds } }
                ]
            };
        }
        else if (!["admin", "superadmin"].includes(appRole)) {
            leadFilter = {
                $or: [
                    { assignedTo: user._id },
                    { createdBy: user._id }
                ]
            };
        }

        /* ---------------- FETCH LEADS ---------------- */

        const leads = await Lead.find(leadFilter)
            .select("_id")
            .lean();

        const leadIds = leads.map(l => l._id);

        /* ---------------- FETCH CONVERSATIONS ---------------- */

        const conversations = await LeadConversation.find({
            lead_id: { $in: leadIds }
        })
            .select("lead_id sessions createdAt updatedAt")
            .populate({
                path: "sessions.createdBy",
                model: RegularUser,
                select: "name email role"
            })
            .sort({ updatedAt: -1 })
            .lean();

        /* ---------------- FORMAT ---------------- */

        const formatted = conversations.map(conv => {
            const sessions = conv.sessions || [];
            const latestSession = sessions[sessions.length - 1];

            return {
                lead_id: conv.lead_id,
                totalSessions: sessions.length,
                latestSession: latestSession
                    ? {
                        rating: latestSession.rating,
                        overallLeadScore: latestSession.overallLeadScore,
                        systemLeadScore: latestSession.systemLeadScore,
                        status: latestSession.status,
                        createdAt: latestSession.createdAt,
                        createdBy: {
                            _id: latestSession.createdBy?._id,
                            name: latestSession.createdBy?.name,
                            email: latestSession.createdBy?.email,
                            role: mapRoleForApp(
                                latestSession.createdBy?.role?.role
                            ) // ✅ FIX
                        }
                    }
                    : null
            };
        });

        return res.status(200).json({
            success: true,
            count: formatted.length,
            data: formatted
        });

    } catch (error) {
        console.error("Get Conversation Error:", error);

        return res.status(500).json({
            error: "Internal Server Error."
        });
    }
};

export const getConversationByLeadId = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);
        const { lead_id } = req.params;

        /* ---------------- AUTH ---------------- */

        if (!mongoose.Types.ObjectId.isValid(authUserId)) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const authUser = await RegularUser.findById(authUserId)
            .populate("role", "role")
            .select("_id role")
            .lean();

        if (!authUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const appRole = mapRoleForApp(authUser.role?.role);

        /* ---------------- VALIDATION ---------------- */

        if (!mongoose.Types.ObjectId.isValid(lead_id)) {
            return res.status(400).json({ error: "Invalid lead_id." });
        }

        /* ---------------- FETCH LEAD (RBAC) ---------------- */

        const lead = await Lead.findById(lead_id)
            .select("_id assignedTo createdBy teamLeader")
            .lean();

        if (!lead) {
            return res.status(404).json({ error: "Lead not found." });
        }

        const isAdmin = ["admin", "superadmin"].includes(appRole);

        const isAssigned =
            lead.assignedTo?.toString() === authUserId.toString();

        const isCreator =
            lead.createdBy?.toString() === authUserId.toString();

        const isTeamLeader =
            appRole === "teamleader" &&
            lead.teamLeader?.toString() === authUserId.toString();

        if (!isAdmin && !isAssigned && !isCreator && !isTeamLeader) {
            return res.status(403).json({
                error: "Access denied"
            });
        }

        /* ---------------- FETCH CONVERSATION ---------------- */

        const conversation = await LeadConversation.findOne({ lead_id })
            .populate({
                path: "sessions.createdBy",
                model: RegularUser,
                select: "name email role"
            })
            .lean();

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found." });
        }

        const sessions = Array.isArray(conversation.sessions)
            ? conversation.sessions
            : [];

        const latestSession =
            sessions.length ? sessions[sessions.length - 1] : null;

        /* ---------------- NO SESSION CASE ---------------- */

        if (!latestSession) {
            return res.status(200).json({
                ...conversation,
                next_follow_up_date: null,
                next_follow_up_time: "",
                latestSession: null,
                explanations: [],
                scoreBreakdown: {
                    intentScore: 0,
                    systemScore: 0,
                    counselorConfidence: 0,
                    finalProbability: 0,
                },
            });
        }

        /* ---------------- SCORE ---------------- */

        const intentScore = Number(latestSession?.overallAnswerScore ?? 0);
        const systemScore = Number(latestSession?.systemLeadScore ?? 0);

        const counselorConfidence = Number(
            latestSession?.counselorConfidenceScore ??
            Math.round(((latestSession?.rating || 0) / 5) * 100)
        );

        const finalProbability = Number(latestSession?.overallLeadScore ?? 0);

        /* ---------------- EXPLANATIONS ---------------- */

        const explanations = buildLeadScoreExplanation({
            questions: latestSession?.questions || [],
            rating: latestSession?.rating || 0,
            sessions,
            next_follow_up_date: latestSession?.next_follow_up_date, // ✅ FIX
            intentScore,
            engagementScore: systemScore,
            finalScore: finalProbability,
        });

        /* ---------------- RESPONSE ---------------- */

        return res.status(200).json({
            ...conversation,

            next_follow_up_date: latestSession?.next_follow_up_date || null,
            next_follow_up_time: latestSession?.next_follow_up_time || "",

            latestSession,
            explanations,

            scoreBreakdown: {
                intentScore,
                systemScore,
                counselorConfidence,
                finalProbability,
            },
        });

    } catch (error) {
        console.error("Get Conversation Error:", error);

        return res.status(500).json({
            error: "Internal Server Error."
        });
    }
};