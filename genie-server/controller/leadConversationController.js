import Lead from "../models/leadsModel.js";
import mongoose from "mongoose";
import LeadConversation from "../models/leadConversation.js";
import { calculateFinalLeadScore } from "../utils/leadScore.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import User from "../models/userModel.js";
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

        const user = await User.findById(userId)
            .select("_id name role organizationId")
            .lean();

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

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
        const lead = await Lead.findById(lead_id)
            .select("_id name assignedTo teamLeader organizationId status");

        if (!lead) {
            return res.status(404).json({ error: "Lead not found." });
        }

        // ---------------- RECIPIENT COLLECTION ----------------
        const recipients = new Set();

        if (lead.assignedTo) recipients.add(lead.assignedTo.toString());
        if (lead.teamLeader) recipients.add(lead.teamLeader.toString());

        const admins = await User.find({
            role: { $in: ["admin", "superadmin"] },
            organizationId: lead.organizationId
        }).select("_id").lean();

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

        // 🔥 Mark previous follow-up as completed
        await LeadConversation.updateOne(
            {
                lead_id,
                "sessions.next_follow_up_date": { $ne: null },
                "sessions.follow_up_completed": false
            },
            {
                $set: {
                    "sessions.$[elem].follow_up_completed": true,
                    "sessions.$[elem].follow_up_completed_at": new Date(),
                    "sessions.$[elem].follow_up_completed_by": userId // ✅ IMPORTANT
                }
            },
            {
                arrayFilters: [
                    {
                        "elem.next_follow_up_date": { $ne: null },
                        "elem.follow_up_completed": false
                    }
                ]
            }
        );

        // ---------------- SAVE SESSION ----------------
        const conversation = await LeadConversation.findOneAndUpdate(
            { lead_id },
            {
                $push: {
                    sessions: {
                        createdBy: userId,
                        role: user.role || "counselor",
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
            }
        ).lean();

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
                    organizationId: lead.organizationId,
                    receiverId: uid,
                    senderId: userId,
                    type: "lead_activity",
                    title: "Lead Conversation Updated",
                    message: `${user.name} (${user.role}) updated conversation with ${lead.name}`,
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
        const conversations = await LeadConversation.find()
            .select("lead_id sessions createdAt updatedAt")
            .populate({
                path: "sessions.createdBy",
                select: "name role email",
            })
            .sort({ updatedAt: -1 })
            .lean();

        const formatted = conversations.map((conv) => {
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
                        createdBy: latestSession.createdBy,
                    }
                    : null,
            };
        });

        return res.status(200).json({
            success: true,
            data: formatted,
        });
    } catch (error) {
        console.error("Get Conversation Error:", error);
        return res.status(500).json({ error: "Internal Server Error." });
    }
};

export const getConversationByLeadId = async (req, res) => {
    try {
        const { lead_id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(lead_id)) {
            return res.status(400).json({ error: "Invalid lead_id." });
        }

        const [conversation, followUp] = await Promise.all([
            LeadConversation.findOne({ lead_id })
                .populate({
                    path: "sessions.createdBy",
                    select: "name email role",
                })
                .lean(),
        ]);

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found." });
        }

        const sessions = Array.isArray(conversation.sessions)
            ? conversation.sessions
            : [];

        const latestSession =
            sessions.length > 0 ? sessions[sessions.length - 1] : null;

        // Guard: no session yet
        if (!latestSession) {
            return res.status(200).json({
                ...conversation,
                next_follow_up_date: followUp?.next_follow_up_date || null,
                next_follow_up_time: followUp?.next_follow_up_time || "",
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

        /* ---------------- SCORE BREAKDOWN ---------------- */
        const intentScore = Number(latestSession?.overallAnswerScore ?? 0);
        const systemScore = Number(latestSession?.systemLeadScore ?? 0);

        // fallback if old records don’t have stored confidence
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
            next_follow_up_date: followUp?.next_follow_up_date,
            intentScore,
            engagementScore: systemScore,
            finalScore: finalProbability,
        });

        return res.status(200).json({
            ...conversation,
            next_follow_up_date: followUp?.next_follow_up_date || null,
            next_follow_up_time: followUp?.next_follow_up_time || "",
            latestSession,
            explanations,

            // 🔥 Explicit hybrid scoring (0–100 each)
            scoreBreakdown: {
                intentScore,
                systemScore,
                counselorConfidence,
                finalProbability,
            },
        });
    } catch (error) {
        console.error("Get Conversation Error:", error);
        return res.status(500).json({ error: "Internal Server Error." });
    }
};