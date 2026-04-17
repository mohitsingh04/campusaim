import Lead from "../models/leadsModel.js";
import LeadConversation from "../models/leadConversation.js";
import path from "path";
import sharp from "sharp";
import fs from "fs";
import User from "../models/userModel.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import mongoose from "mongoose";
import XLSX from "xlsx";
import { mapRowToLead } from "../utils/mapRowToLead.js";
import { buildLeadTimeline } from "../utils/leadTimeline.js";
import { detectLeadSource } from "../utils/detectLeadSource.js";
import { notifyLeadCreated } from "../helper/notification/notificationHelper.js";
import { createNotification } from "../services/notification.service.js";
import { updateGoalProgress } from "../utils/updateGoalProgress.js";
import { normalizeIndianPhone } from "../utils/normalizePhone.js";
import { handleAdmission } from "../utils/handleAdmission.js";
import { handleCommission } from "../utils/handleCommission.js";
import IncentiveEarning from "../models/incentiveEarning.js";
import { db } from '../mongoose/index.js';

const COURSE_TYPES = ["UG", "PG", "Diploma", "Certificate", "PhD", "Other"];
const COLLEGE_TYPES = ["Government", "Private", "Deemed", "Autonomous", "Any"];

const sanitizeEnum = (value, allowed) => {
    if (!value) return undefined;
    const v = String(value).trim();
    return allowed.includes(v) ? v : undefined;
};

const getGoalOwner = async (lead) => {
    const ownerId = lead.assignedTo || lead.createdBy;

    if (!ownerId) return null;

    const user = await User.findById(ownerId).select("role").lean();

    if (!user || user.role !== "counselor") {
        console.log("❌ Owner is not counselor");
        return null;
    }

    return ownerId;
};

function ensureDir(folder) {
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
}

const moveFile = (src, dest) => {
    fs.renameSync(src, dest);
};

const compressImage = async (input, output) => {
    await sharp(input).resize({ width: 600 }).jpeg({ quality: 60 }).toFile(output);
};

const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

/* ---------------- NEW CONTROLLERS ---------------- */
export const getLeads = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);

        if (!mongoose.Types.ObjectId.isValid(authUserId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const user = await User.findById(authUserId)
            .select("_id role")
            .lean();

        if (!user) {
            return res.status(404).json({ error: "Auth user not found." });
        }

        const { _id, role } = user;

        /* ================= BASE QUERY ================= */
        const finalQuery = {}; // ✅ NO org dependency

        const andClauses = [];
        const roleConditions = [];
        const searchConditions = [];
        const filterConditions = [];

        /* ================= ROLE FILTER ================= */
        if (role === "teamleader") {
            const counselors = await User.find({
                role: "counselor",
                teamLeader: _id,
            }).select("_id").lean();

            const counselorIds = counselors.map((c) => c._id);

            roleConditions.push(
                { createdBy: _id },
                { assignedTo: _id },
                { createdBy: { $in: counselorIds } },
                { assignedTo: { $in: counselorIds } }
            );
        }
        else if (role !== "admin") {
            roleConditions.push(
                { createdBy: _id },
                { assignedTo: _id }
            );
        }

        if (roleConditions.length > 0) {
            andClauses.push({ $or: roleConditions });
        }

        /* ================= SEARCH ================= */
        const sanitizedSearch = String(req.query.search || "").trim();

        if (sanitizedSearch) {
            const isObjectId = mongoose.Types.ObjectId.isValid(sanitizedSearch);

            if (isObjectId) {
                searchConditions.push({
                    _id: new mongoose.Types.ObjectId(sanitizedSearch),
                });
            } else {
                const safeSearch = sanitizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

                searchConditions.push(
                    { name: { $regex: safeSearch, $options: "i" } },
                    { email: { $regex: safeSearch, $options: "i" } },
                    { contact: { $regex: safeSearch, $options: "i" } } // ✅ FIX mobile → contact
                );
            }

            andClauses.push({ $or: searchConditions });
        }

        /* ================= FILTERS ================= */

        if (req.query.status) {
            filterConditions.push({ status: req.query.status });
        }

        if (req.query.assigned === "false") {
            filterConditions.push({
                $or: [{ assignedTo: null }, { assignedTo: { $exists: false } }],
            });
        }

        if (req.query.filter === "today") {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            filterConditions.push({
                createdAt: { $gte: todayStart, $lte: todayEnd },
            });
        }

        if (req.query.followup === "today") {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const followups = await db.collection("leadconversations")
                .aggregate([
                    { $unwind: "$sessions" },
                    {
                        $match: {
                            "sessions.next_follow_up_date": {
                                $gte: todayStart,
                                $lte: todayEnd,
                            },
                            "sessions.follow_up_completed": false
                        },
                    },
                    { $group: { _id: "$lead_id" } },
                ])
                .toArray();

            const leadIds = followups.map((f) => f._id);

            filterConditions.push({
                _id: { $in: leadIds.length ? leadIds : [null] },
            });
        }

        if (filterConditions.length > 0) {
            andClauses.push({ $and: filterConditions });
        }

        if (andClauses.length > 0) {
            finalQuery.$and = andClauses;
        }

        /* ================= DATA ================= */
        const leads = await Lead.find(finalQuery)
            .sort({ createdAt: -1 })
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name role")
            .lean();

        return res.status(200).json({
            success: true,
            count: leads.length,
            data: leads,
        });

    } catch (error) {
        console.error("Error fetching leads:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getUserLeads = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);

        if (!mongoose.Types.ObjectId.isValid(authUserId)) {
            return res.status(400).json({ error: "Invalid auth user ID" });
        }

        const authUser = await User.findById(authUserId)
            .select("_id role")
            .lean();

        if (!authUser) {
            return res.status(404).json({ error: "Auth user not found" });
        }

        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const targetUser = await User.findById(userId)
            .select("_id role teamLeader createdBy")
            .lean();

        if (!targetUser) {
            return res.status(404).json({ error: "Target user not found" });
        }

        /* ---------------- PERMISSION RULES (ROLE BASED) ---------------- */

        const isAdmin = authUser.role === "admin";

        const isPartner =
            authUser.role === "partner" &&
            targetUser.createdBy?.toString() === authUser._id.toString();

        const isTeamLeader =
            authUser.role === "teamleader" &&
            targetUser.teamLeader?.toString() === authUser._id.toString();

        const isSelf =
            authUser._id.toString() === targetUser._id.toString();

        if (!isAdmin && !isPartner && !isTeamLeader && !isSelf) {
            return res.status(403).json({ error: "Not allowed to view leads" });
        }

        /* ---------------- FETCH LEADS ---------------- */

        const leads = await Lead.find({
            $or: [
                { createdBy: targetUser._id },
                { assignedTo: targetUser._id }
            ]
        })
            .sort({ createdAt: -1 })
            .populate("createdBy", "name role")
            .populate("assignedTo", "name role")
            .lean();

        return res.status(200).json({
            success: true,
            count: leads.length,
            data: leads
        });
    } catch (error) {
        console.error("Error fetching user leads:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getLeadById = async (req, res) => {
    try {
        const { id } = req.params;

        // ---------------- VALIDATION ----------------
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID" });
        }

        // ---------------- FETCH LEAD ----------------
        const lead = await Lead.findById(id)
            .populate("createdBy", "name role email")
            .populate("convertedBy", "name role email")
            .populate({
                path: "assignedTo",
                select: "name role email teamLeader",
                populate: {
                    path: "teamLeader",
                    select: "name role email",
                },
            })
            .populate("assignmentHistory.assignedTo", "name role email")
            .populate("assignmentHistory.assignedBy", "name role email")
            .lean();

        if (!lead) {
            return res.status(404).json({ error: "Lead not found" });
        }

        // ---------------- SORT ASSIGNMENT HISTORY ----------------
        if (Array.isArray(lead.assignmentHistory)) {
            lead.assignmentHistory.sort(
                (a, b) =>
                    new Date(b?.assignedOn || 0) -
                    new Date(a?.assignedOn || 0)
            );
        }

        // ---------------- DERIVE Team Leader ----------------
        let teamleader = null;

        if (lead.assignedTo) {
            if (lead.assignedTo.role === "teamleader") {
                teamleader = lead.assignedTo;
            } else if (
                lead.assignedTo.role === "counselor" &&
                lead.assignedTo.teamLeader
            ) {
                teamleader = lead.assignedTo.teamLeader;
            }
        }

        // ---------------- FETCH LAST CONVERSATION (LIGHTWEIGHT) ----------------
        const conversation = await LeadConversation.findOne({ lead_id: id })
            .select(`sessions.createdBy 
                    sessions.createdAt 
                    sessions.next_follow_up_date 
                    sessions.next_follow_up_time`)
            .lean();

        let hasConversation = false;
        let lastConversationBy = null;
        let lastConversationAt = null;

        if (conversation?.sessions?.length) {
            hasConversation = true;

            const lastSession = conversation.sessions.at(-1);

            lastConversationBy =
                typeof lastSession?.createdBy === "object"
                    ? lastSession.createdBy?._id
                    : lastSession?.createdBy;

            lastConversationAt = lastSession?.createdAt || null;
        }

        let nextFollowUp = null;

        if (conversation?.sessions?.length) {
            const lastSession = conversation.sessions.at(-1);

            if (lastSession?.next_follow_up_date) {
                nextFollowUp = {
                    date: lastSession.next_follow_up_date,
                    time: lastSession.next_follow_up_time || ""
                };
            }
        }

        // ---------------- RESPONSE ----------------
        return res.status(200).json({
            ...lead,
            teamleader,

            hasConversation,
            lastConversationBy,
            lastConversationAt,

            nextFollowUp, // ✅ FIXED
        });

    } catch (error) {
        console.error("Error fetching single lead:", error);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const getLeadTimeline = async (req, res) => {
    try {

        const { id } = req.params;

        const events = await buildLeadTimeline(id);

        return res.status(200).json({
            timeline: events
        });

    } catch (error) {

        console.error("Lead Timeline Error:", error);

        return res.status(500).json({
            error: "Failed to load timeline"
        });
    }
};

export const addLead = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);

        if (!mongoose.Types.ObjectId.isValid(authUserId)) {
            return res.status(401).json({ error: "Unauthorized user" });
        }

        const authUser = await User.findById(authUserId)
            .select("_id name role")
            .lean();

        const marketingData = detectLeadSource(req);

        const {
            name,
            email,
            contact,
            address = "",
            city = "",
            state = "",
            pincode = "",
            academics = {},
            preferences = {},
            ref_code,
        } = req.body || {};

        /* ------------------ Validation ------------------ */
        if (!name || !email || !contact) {
            return res.status(400).json({
                error: "Name, email and contact are required",
            });
        }

        const sanitizedName = String(name).trim();
        const sanitizedEmail = String(email).trim().toLowerCase();
        const sanitizedContact = String(contact).replace(/\s/g, "");

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        if (!/^(\+91|0)?[6-9][0-9]{9}$/.test(sanitizedContact)) {
            return res.status(400).json({ error: "Invalid contact number" });
        }

        /* ------------------ Resolve Creator ------------------ */
        let userId = authUser._id;

        if (ref_code) {
            const refUser = await User.findOne({ ref_code })
                .select("_id role")
                .lean();

            if (!refUser || refUser.role !== "partner") {
                return res.status(403).json({
                    error: "Invalid partner referral code",
                });
            }

            userId = refUser._id;
        }

        /* ------------------ Duplicate Check ------------------ */
        const [emailExists, contactExists] = await Promise.all([
            Lead.exists({ email: sanitizedEmail }),
            Lead.exists({ contact: sanitizedContact }),
        ]);

        if (emailExists) {
            return res.status(400).json({ error: "Email already exists" });
        }

        if (contactExists) {
            return res.status(400).json({ error: "Contact already exists" });
        }

        /* ------------------ Payload ------------------ */
        const leadPayload = {
            createdBy: userId,
            assignedTo: null, // optional: can auto-assign later

            name: sanitizedName,
            email: sanitizedEmail,
            contact: sanitizedContact,
            address: address?.trim() || "",
            city: city?.trim() || preferences?.preferredCity || "",
            state: state?.trim() || "",
            pincode: pincode?.trim() || "",

            academics: {
                qualification: academics?.qualification?.trim() || "",
                boardOrUniversity: academics?.boardOrUniversity?.trim() || "",
                passingYear: academics?.passingYear || null,
                percentage: academics?.percentage || null,
                stream: academics?.stream?.trim() || "",
            },

            preferences: {
                courseName: preferences?.courseName?.trim() || undefined,
                courseType: sanitizeEnum(preferences?.courseType, COURSE_TYPES),
                specialization: preferences?.specialization?.trim() || undefined,
                preferredState: preferences?.preferredState?.trim() || undefined,
                preferredCity: preferences?.preferredCity?.trim() || undefined,
                collegeType:
                    sanitizeEnum(preferences?.collegeType, COLLEGE_TYPES) || "Any",
            },

            marketing: marketingData,
            leadType: ref_code ? "partner" : "manual",
            lastActivity: new Date(),
        };

        /* ------------------ Create Lead ------------------ */
        const newLead = await Lead.create(leadPayload);

        /* ------------------ Notification ------------------ */
        await notifyLeadCreated({
            authUser,
            leadIds: [newLead._id],
            leadName: newLead.name
        });

        return res.status(201).json({
            message: "Lead created successfully",
            lead: newLead,
        });

    } catch (err) {
        console.error("Add Lead Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const updateLead = async (req, res) => {
    try {
        // ---------------- AUTH ----------------
        const senderId = await getDataFromToken(req);
        if (!mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(400).json({ error: "Invalid user" });
        }

        const actor = await User.findById(senderId)
            .select("_id name role")
            .lean();

        if (!actor) {
            return res.status(404).json({ error: "User not found" });
        }

        // ---------------- PARAM ----------------
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid lead ID" });
        }

        const lead = await Lead.findById(id);
        if (!lead) {
            return res.status(404).json({ error: "Lead not found" });
        }

        const {
            name,
            email,
            contact,
            address,
            city,
            state,
            pincode,
            academics,
            preferences
        } = req.body;

        // ---------------- CORE FIELDS ----------------
        if (name !== undefined) {
            const cleanName = String(name).trim();
            if (!cleanName) return res.status(400).json({ error: "Name cannot be empty" });
            lead.name = cleanName;
        }

        if (email !== undefined) {
            const cleanEmail = String(email).toLowerCase().trim();
            if (!cleanEmail) return res.status(400).json({ error: "Email cannot be empty" });
            lead.email = cleanEmail;
        }

        if (contact !== undefined) {
            const normalizedContact = String(contact).replace(/\s/g, "");
            if (!/^(\+91|0)?[6-9]\d{9}$/.test(normalizedContact)) {
                return res.status(400).json({ error: "Invalid Indian contact number" });
            }
            lead.contact = normalizedContact;
        }

        // ---------------- ADDRESS ----------------
        if (address !== undefined) lead.address = address ? String(address).trim() : "";
        if (city !== undefined) lead.city = city ? String(city).trim() : "";
        if (state !== undefined) lead.state = state ? String(state).trim() : "";

        if (pincode !== undefined) {
            if (pincode && !/^\d{6}$/.test(pincode)) {
                return res.status(400).json({ error: "Invalid pincode" });
            }
            lead.pincode = pincode ? String(pincode).trim() : "";
        }

        // ---------------- ACADEMICS ----------------
        if (academics && typeof academics === "object") {
            lead.academics = {
                qualification: academics.qualification !== undefined ? String(academics.qualification || "").trim() : lead.academics?.qualification,
                boardOrUniversity: academics.boardOrUniversity !== undefined ? String(academics.boardOrUniversity || "").trim() : lead.academics?.boardOrUniversity,
                passingYear: academics.passingYear !== undefined ? academics.passingYear || null : lead.academics?.passingYear,
                percentage: academics.percentage !== undefined ? academics.percentage || null : lead.academics?.percentage,
                stream: academics.stream !== undefined ? String(academics.stream || "").trim() : lead.academics?.stream
            };
        }

        // ---------------- PREFERENCES ----------------
        if (preferences && typeof preferences === "object") {
            lead.preferences = {
                courseName: preferences.courseName !== undefined ? String(preferences.courseName || "").trim() : lead.preferences?.courseName,
                courseType: preferences.courseType !== undefined && preferences.courseType !== "" ? preferences.courseType : lead.preferences?.courseType,
                specialization: preferences.specialization !== undefined ? String(preferences.specialization || "").trim() : lead.preferences?.specialization,
                preferredState: preferences.preferredState !== undefined ? String(preferences.preferredState || "").trim() : lead.preferences?.preferredState,
                preferredCity: preferences.preferredCity !== undefined ? String(preferences.preferredCity || "").trim() : lead.preferences?.preferredCity,
                collegeType: preferences.collegeType !== undefined && preferences.collegeType !== "" ? preferences.collegeType : lead.preferences?.collegeType
            };
        }

        // ---------------- SAVE ----------------
        await lead.save();

        return res.status(200).json({
            message: "Lead updated successfully",
            lead
        });

    } catch (err) {
        console.error("Update Lead Error:", err);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const updateLeadStatus = async (req, res) => {
    try {
        const senderId = await getDataFromToken(req);

        if (!mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(400).json({ error: "Invalid user" });
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid lead ID" });
        }

        const lead = await Lead.findById(id);
        if (!lead) {
            return res.status(404).json({ error: "Lead not found" });
        }

        const { status, applicationDoneBy, courseId, admission } = req.body;
        const oldStatus = lead.status;

        const ALLOWED = ["new", "contacted", "applications_done", "converted", "lost"];

        if (!ALLOWED.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        // ---------------- APPLICATION ----------------
        if (status === "applications_done") {
            if (!applicationDoneBy || !mongoose.Types.ObjectId.isValid(applicationDoneBy)) {
                return res.status(400).json({ error: "Application Done By required" });
            }

            if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
                return res.status(400).json({ error: "Valid courseId required" });
            }

            lead.applicationDoneBy = applicationDoneBy;
            lead.courseId = courseId;
            lead.applicationFilledAt = new Date();
        }

        lead.status = status;

        // ---------------- ADMISSION ----------------
        if (status === "converted") {
            if (!admission?.userId || !admission?.courseId || !admission?.collegeId) {
                return res.status(400).json({ error: "Complete admission data required" });
            }

            if (
                !mongoose.Types.ObjectId.isValid(admission.userId) ||
                !mongoose.Types.ObjectId.isValid(admission.courseId)
            ) {
                return res.status(400).json({ error: "Invalid admission IDs" });
            }

            const collegeId = mongoose.Types.ObjectId.isValid(admission.collegeId)
                ? admission.collegeId
                : null;

            lead.admission = {
                userId: admission.userId,
                courseId: admission.courseId,
                collegeId,
                confirmedBy: senderId,
                confirmedAt: new Date(),
            };

            const exists = await IncentiveEarning.exists({ leadId: lead._id });

            if (!exists) {
                await handleAdmission(lead);
            }

            await handleCommission(lead);
        }

        // ---------------- RESET ----------------
        if (oldStatus === "applications_done" && status !== "applications_done") {
            lead.applicationDoneBy = null;
            lead.applicationFilledAt = null;
            lead.courseId = null;
        }

        if (oldStatus === "converted" && status !== "converted") {
            lead.admission = {};
        }

        await lead.save();

        // ================= GOAL PROGRESS =================
        const goalOwner = await getGoalOwner(lead);

        if (goalOwner && status !== oldStatus) {

            if (status === "applications_done" && oldStatus !== "applications_done") {
                await updateGoalProgress(goalOwner, "applications_done");
            }

            if (status === "converted" && oldStatus !== "converted") {
                await updateGoalProgress(goalOwner, "admissions_done");
            }
        }

        return res.status(200).json({
            success: true,
            message: "Status updated successfully",
            lead
        });

    } catch (err) {
        console.error("updateLeadStatus error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteLead = async (req, res) => {
    try {
        const { id } = req.params;

        // Strict ObjectId validation (prevents malformed queries / NoSQL abuse)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid lead ID" });
        }

        const leadId = new mongoose.Types.ObjectId(id);

        // 1. Delete main lead
        const lead = await Lead.findByIdAndDelete(leadId);
        if (!lead) {
            return res.status(404).json({ error: "Lead not found" });
        }

        // 2. Cascade delete related documents
        await Promise.all([
            LeadConversation.deleteMany({ lead_id: leadId }),
        ]);

        return res.status(200).json({
            message: "Lead and related conversations & follow-ups deleted successfully",
        });
    } catch (err) {
        console.error("Delete Lead Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteMultiLeads = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "No lead IDs provided" });
        }

        // Validate ObjectIds
        const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length) {
            return res.status(400).json({
                error: "One or more IDs are invalid",
                invalidIds,
            });
        }

        const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

        // 1. Delete leads
        const result = await Lead.deleteMany({
            _id: { $in: objectIds },
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: "No leads found for deletion",
            });
        }

        // 2. Cascade delete related documents
        await Promise.all([
            LeadConversation.deleteMany({ lead_id: { $in: objectIds } }),
        ]);

        return res.status(200).json({
            message: `Successfully deleted ${result.deletedCount} lead(s) and related data`,
        });
    } catch (err) {
        console.error("Bulk Delete Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const addbulkLeads = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);
        const user = await User.findById(userId).select("_id role name");
        if (!user) return res.status(404).json({ error: "User not found." });

        if (!req.file) return res.status(400).json({ error: "No file uploaded." });

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (!rows.length) return res.status(400).json({ error: "Uploaded file is empty." });

        const validLeads = [];
        const rejected = [];

        rows.forEach((row, index) => {
            const lead = mapRowToLead(row, user);
            const rowNum = index + 2;

            // only NAME required
            if (!lead.name) {
                rejected.push({ row: rowNum, reason: "Missing Name" });
                return;
            }

            validLeads.push({
                ...lead,
                leadType: "import",
                marketing: {
                    platform: "offline",
                    source: "excel-import",
                    campaign: "",
                    medium: "",
                    referrer: "",
                    utm: {}
                },
                rawImport: row,
                importMeta: {
                    fileName: req.file.originalname,
                    uploadedBy: user._id,
                    uploadedAt: new Date(),
                    rowNumber: rowNum
                }
            });
        });

        let insertedLeads = [];

        if (validLeads.length > 0) {
            insertedLeads = await Lead.insertMany(validLeads, { ordered: false });
        }

        if (insertedLeads.length) {
            await notifyLeadCreated({
                authUser: user,
                leadIds: insertedLeads.map(l => l._id)
            });
        }

        return res.status(200).json({
            success: true,
            message: `${insertedLeads.length} leads imported.`,
            rejectedCount: rejected.length,
            rejected
        });

    } catch (error) {
        console.error("Bulk upload error:", error);
        return res.status(500).json({ error: "Internal Server Error during import." });
    }
};

export const createPublicLead = async (req, res) => {
    try {
        const { name, email, contact, course, ref_code } = req.body || {};

        if (!name || !email || !contact) {
            return res.status(400).json({ error: "Required fields missing" });
        }

        const sanitizedName = String(name).trim();
        const sanitizedEmail = String(email).trim().toLowerCase();
        const sanitizedContact = String(contact).replace(/\s/g, "");

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
            return res.status(400).json({ error: "Invalid email" });
        }

        if (!/^(\+91|0)?[6-9][0-9]{9}$/.test(sanitizedContact)) {
            return res.status(400).json({ error: "Invalid contact" });
        }

        /* ------------------ Resolve Partner ------------------ */
        let user = null;
        let refApplied = false;

        if (ref_code) {
            user = await User.findOne({ ref_code, role: "partner" })
                .select("_id name")
                .lean();

            if (user) refApplied = true;
        }

        /* ------------------ Duplicate Check ------------------ */
        const exists = await Lead.exists({
            $or: [{ email: sanitizedEmail }, { contact: sanitizedContact }]
        });

        if (exists) {
            return res.status(200).json({
                message: "Lead already exists",
                refApplied
            });
        }

        /* ------------------ Resolve Owner ------------------ */
        let createdBy = null;

        if (refApplied && user) {
            createdBy = user._id;
        } else {
            // fallback → assign to admin
            const admin = await User.findOne({ role: "admin" })
                .select("_id")
                .lean();

            createdBy = admin?._id || null;
        }

        /* ------------------ Create Lead ------------------ */
        const lead = await Lead.create({
            createdBy,
            assignedTo: null,

            name: sanitizedName,
            email: sanitizedEmail,
            contact: sanitizedContact,
            preferences: {
                courseName: course?.trim()
            },

            leadType: refApplied ? "partner" : "external",
            source: "external_form",
            lastActivity: new Date(),
        });

        return res.status(201).json({
            message: "Lead created",
            leadId: lead._id,
            refApplied,
            partnerName: user?.name || null
        });

    } catch (err) {
        console.error("Public Lead Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const addExternalLead = async (req, res) => {
    try {
        const {
            name,
            email,
            contact,
            address = "",
            city = "",
            state = "",
            pincode = "",
            academics = {},
            preferences = {},
            marketing = {},
            source = "external",
            property_id,
            course_id,
        } = req.body || {};

        if (!name || !email || !contact) {
            return res.status(400).json({
                error: "name, email, contact are required",
            });
        }

        const sanitizedName = String(name).trim();
        const sanitizedEmail = String(email).trim().toLowerCase();
        const sanitizedContact = normalizeIndianPhone(contact);

        if (!sanitizedContact) {
            return res.status(400).json({ error: "Invalid contact number" });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        /* ------------------ Resolve Owner ------------------ */
        const admin = await User.findOne({ role: "admin" })
            .select("_id")
            .lean();

        const adminId = admin?._id || null;

        /* ------------------ Marketing ------------------ */
        const detectedMarketing = detectLeadSource(req);

        /* ------------------ Payload ------------------ */
        const leadPayload = {
            property_id,
            course_id,

            createdBy: adminId,
            assignedTo: null,

            name: sanitizedName,
            email: sanitizedEmail,
            contact: sanitizedContact,
            address: address?.trim() || "",
            city: city?.trim() || preferences?.preferredCity || "",
            state: state?.trim() || "",
            pincode: pincode?.trim() || "",

            academics: {
                qualification: academics?.qualification?.trim() || "",
                boardOrUniversity: academics?.boardOrUniversity?.trim() || "",
                passingYear: academics?.passingYear || null,
                percentage: academics?.percentage || null,
                stream: academics?.stream?.trim() || "",
            },

            preferences: {
                courseName: preferences?.courseName?.trim() || undefined,
                courseType: sanitizeEnum(preferences?.courseType, COURSE_TYPES),
                specialization: preferences?.specialization?.trim() || undefined,
                preferredState: preferences?.preferredState?.trim() || undefined,
                preferredCity: preferences?.preferredCity?.trim() || undefined,
                collegeType:
                    sanitizeEnum(preferences?.collegeType, COLLEGE_TYPES) || "Any",
            },

            marketing: {
                ...detectedMarketing,
                ...marketing,
                source,
            },

            leadType: "external",
            isExternal: true,
            lastActivity: new Date(),
        };

        /* ------------------ Create ------------------ */
        const newLead = await Lead.create(leadPayload);

        /* ------------------ Notification ------------------ */
        await notifyLeadCreated({
            authUser: null,
            leadIds: [newLead._id],
            leadName: newLead.name,
        });

        return res.status(201).json({
            success: true,
            message: "External lead created successfully",
            leadId: newLead._id,
        });

    } catch (err) {
        console.error("External Lead Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const followUps = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }

        const { type = "today" } = req.query; // // today | upcoming | all

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        let dateFilter = {};

        if (type === "today") {
            dateFilter = {
                $gte: startOfDay,
                $lte: endOfDay,
            };
        } else if (type === "upcoming") {
            dateFilter = {
                $gt: endOfDay,
            };
        } else if (type === "past") {
            dateFilter = {
                $lt: startOfDay,
            };
        }

        const followUps = await LeadConversation.aggregate([
            // // STEP 1: explode sessions
            { $unwind: "$sessions" },

            // // STEP 2: filter only sessions having follow-up date
            {
                $match: {
                    "sessions.next_follow_up_date": {
                        $ne: null,
                        ...(type !== "all" && dateFilter),
                    },
                },
            },

            // // STEP 3: optional user-based filter (security)
            {
                $match: {
                    "sessions.createdBy": new mongoose.Types.ObjectId(userId),
                },
            },

            // // STEP 4: join with Lead
            {
                $lookup: {
                    from: "leads",
                    localField: "lead_id",
                    foreignField: "_id",
                    as: "lead",
                },
            },
            { $unwind: "$lead" },

            // // STEP 5: shape response
            {
                $project: {
                    _id: 0,
                    leadId: "$lead._id",
                    name: "$lead.name",
                    contact: "$lead.contact",
                    email: "$lead.email",
                    assignedTo: "$lead.assignedTo",
                    status: "$lead.status",
                    sessionId: "$sessions._id",

                    followUpDate: "$sessions.next_follow_up_date",
                    followUpTime: "$sessions.next_follow_up_time",
                    followUpCompleted: "$sessions.follow_up_completed",
                    followUpCompletedAt: "$sessions.follow_up_completed_at",

                    message: "$sessions.message",
                    nextAction: "$sessions.nextAction",
                    score: "$sessions.overallLeadScore",
                },
            },

            // // STEP 6: sort
            {
                $sort: {
                    followUpDate: 1,
                },
            },
        ]);

        return res.status(200).json({
            success: true,
            count: followUps.length,
            data: followUps,
        });
    } catch (error) {
        console.error("Follow Ups Error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};