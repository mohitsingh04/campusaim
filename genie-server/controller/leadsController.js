import Lead from "../models/leadsModel.js";
import LeadConversation from "../models/leadConversation.js";
import path from "path";
import sharp from "sharp";
import fs from "fs";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import mongoose from "mongoose";
import XLSX from "xlsx";
import { mapRowToLead } from "../utils/mapRowToLead.js";
import { buildLeadTimeline } from "../utils/leadTimeline.js";
import { detectLeadSource } from "../utils/detectLeadSource.js";
import { notifyLeadCreated } from "../helper/notification/notificationHelper.js";
import { updateGoalProgress } from "../utils/updateGoalProgress.js";
import { normalizeIndianPhone } from "../utils/normalizePhone.js";
import { handleAdmission } from "../utils/handleAdmission.js";
import { handleCommission } from "../utils/handleCommission.js";
import IncentiveEarning from "../models/incentiveEarning.js";
import { db } from '../mongoose/index.js';
import { getRoleMap, mapRoleForApp, getDbRoleKey, getRoleId } from "../utils/roleMapper.js";
import RegularUser from "../models/regularUser.js";
import Property from "../models/property.js";
import { sanitizePayload } from "../utils/sanitizeLeadPayload.js";
import {
    GENDER_TYPES,
    HOSTEL_TYPES,
    EXAM_MODES,
    EXAM_BATCHES,
    COLLEGE_TYPES,
} from "../constants/enums.js";

import { sanitizeEnum } from "../utils/enum.js";

const COURSE_TYPES = ["UG", "PG", "Diploma", "Certificate", "PhD", "Other"];

const getGoalOwner = async (lead) => {
    try {
        const ownerId = lead.assignedTo || lead.createdBy;

        if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
            return null;
        }

        const user = await RegularUser.findById(ownerId)
            .populate("role", "role")
            .select("_id role")
            .lean();

        if (!user) return null;

        const appRole = mapRoleForApp(user.role?.role); // ✅ FIX

        if (appRole !== "counselor") {
            return null;
        }

        return user._id;

    } catch (err) {
        console.error("getGoalOwner error:", err);
        return null;
    }
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

        const user = await RegularUser.findById(authUserId)
            .populate("role", "role")
            .select("_id role organizationId")
            .lean();


        if (!user) {
            return res.status(404).json({ error: "Auth user not found." });
        }

        const appRole = mapRoleForApp(user.role?.role); // ✅ FIX
        const organizationId = user?.organizationId;
        const userId = user._id;

        /* ================= BASE QUERY ================= */
        const finalQuery = {};
        const andClauses = [];
        const roleConditions = [];
        const searchConditions = [];
        const filterConditions = [];

        if (!organizationId) {
            return res.status(403).json({
                error: "Please add your organization first."
            });
        }

        andClauses.push({ organizationId });

        /* ================= ROLE FILTER ================= */
        /* ---------- ADMIN ---------- */
        if (appRole === "admin") {
            // admin sees all leads in organization
            // no extra roleConditions needed
        }

        /* ---------- TEAMLEADER ---------- */
        else if (appRole === "teamleader") {
            const counselorRoleId = await getRoleId("counselor");

            const counselors = await RegularUser.find({
                role: counselorRoleId,
                teamLeader: userId,
                organizationId // ✅ enforce same org
            }).select("_id").lean();

            const counselorIds = counselors.map(c => c._id);

            roleConditions.push(
                { createdBy: userId },                // own created
                { assignedTo: userId },               // assigned to TL
                { createdBy: { $in: counselorIds } }, // counselor created
                { assignedTo: { $in: counselorIds } } // counselor assigned
            );
        }

        /* ---------- COUNSELOR ---------- */
        else if (appRole === "counselor") {
            roleConditions.push(
                { createdBy: userId },
                { assignedTo: userId }
            );
        }

        /* ---------- PARTNER ---------- */
        else if (appRole === "partner") {
            roleConditions.push(
                { createdBy: userId } // ✅ ONLY createdBy (IMPORTANT FIX)
            );
        }

        if (roleConditions.length) {
            andClauses.push({ $or: roleConditions });
        }

        if (roleConditions.length) {
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
                    { contact: { $regex: safeSearch, $options: "i" } }
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
                $or: [
                    { assignedTo: null },
                    { assignedTo: { $exists: false } }
                ]
            });
        }

        if (req.query.filter === "today") {
            const start = new Date(); start.setHours(0, 0, 0, 0);
            const end = new Date(); end.setHours(23, 59, 59, 999);

            filterConditions.push({
                createdAt: { $gte: start, $lte: end }
            });
        }

        if (filterConditions.length) {
            andClauses.push({ $and: filterConditions });
        }

        if (andClauses.length) {
            finalQuery.$and = andClauses;
        }

        /* ================= DATA ================= */

        const leads = await Lead.find(finalQuery)
            .sort({ createdAt: -1 })
            .populate({
                path: "createdBy",
                model: RegularUser,
                select: "name email role", // ✅ comma added
                populate: { path: "role", select: "role" }
            })
            .populate({
                path: "assignedTo",
                model: RegularUser,
                select: "name email role", // ✅ comma added
                populate: { path: "role", select: "role" }
            })
            .lean();

        return res.status(200).json({
            success: true,
            count: leads.length,
            data: leads
        });

    } catch (error) {
        console.error("Error fetching leads:", error);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const getUserLeads = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);

        if (!mongoose.Types.ObjectId.isValid(authUserId)) {
            return res.status(400).json({ error: "Invalid auth user ID" });
        }

        // 🔎 Auth user with role
        const authUser = await RegularUser.findById(authUserId)
            .populate("role", "role")
            .select("_id role organizationId")
            .lean();

        if (!authUser) {
            return res.status(404).json({ error: "Auth user not found" });
        }

        const authAppRole = mapRoleForApp(authUser.role?.role); // ✅ FIX

        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        // 🔎 Target user
        const targetUser = await RegularUser.findById(userId)
            .populate("role", "role")
            .select("_id role organizationId teamLeader createdBy")
            .lean();

        if (!targetUser) {
            return res.status(404).json({ error: "Target user not found" });
        }

        const targetAppRole = mapRoleForApp(targetUser.role?.role);

        // 🔐 Organization boundary
        if (
            authUser.organizationId.toString() !==
            targetUser.organizationId.toString()
        ) {
            return res.status(403).json({ error: "Access denied" });
        }

        /* ---------------- PERMISSION RULES ---------------- */

        const isAdmin = authAppRole === "admin";

        const isPartner =
            authAppRole === "partner" &&
            targetUser.createdBy?.toString() === authUser._id.toString();

        const isTeamLeader =
            authAppRole === "teamleader" &&
            targetUser.teamLeader?.toString() === authUser._id.toString();

        const isSelf =
            authUser._id.toString() === targetUser._id.toString();

        if (!isAdmin && !isPartner && !isTeamLeader && !isSelf) {
            return res.status(403).json({ error: "Not allowed to view leads" });
        }

        /* ---------------- FETCH LEADS ---------------- */

        const leads = await Lead.find({
            organizationId: authUser.organizationId,
            $or: [
                { createdBy: targetUser._id },
                { assignedTo: targetUser._id }
            ]
        })
            .sort({ createdAt: -1 })
            .populate({ path: "createdBy", model: RegularUser, select: "name email role" })
            .populate({ path: "assignedTo", model: RegularUser, select: "name role" })
            .lean();

        return res.status(200).json({
            success: true,
            count: leads.length,
            data: leads
        });

    } catch (error) {
        console.error("Error fetching user leads:", error);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const getLeadById = async (req, res) => {
    try {
        const { id } = req.params;

        /* ---------------- VALIDATION ---------------- */
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID" });
        }

        /* ---------------- FETCH LEAD ---------------- */

        const lead = await Lead.findById(id)
            .populate({
                path: "createdBy",
                model: RegularUser,
                select: "name email role",
                populate: {
                    path: "role",
                    select: "role" // 👈 this is the actual role name
                }
            })
            .populate({
                path: "convertedBy",
                model: RegularUser,
                select: "name role",
                populate: {
                    path: "role",
                    select: "role" // 👈 this is the actual role name
                }
            })
            .populate({
                path: "assignedTo",
                model: RegularUser,
                select: "name email role teamLeader",
                populate: [
                    {
                        path: "role",
                        select: "role"
                    },
                    {
                        path: "teamLeader",
                        model: RegularUser,
                        select: "name email role",
                        populate: {
                            path: "role",
                            select: "role"
                        }
                    }
                ]
            })
            .populate({ path: "assignmentHistory.assignedTo", model: RegularUser, select: "name role" })
            .populate({ path: "assignmentHistory.assignedBy", model: RegularUser, select: "name role" })
            .populate("rawImport")
            .lean();

        if (!lead) {
            return res.status(404).json({ error: "Lead not found" });
        }

        /* ---------------- SORT ASSIGNMENT HISTORY ---------------- */

        if (Array.isArray(lead.assignmentHistory)) {
            lead.assignmentHistory.sort(
                (a, b) =>
                    new Date(b?.assignedOn || 0) -
                    new Date(a?.assignedOn || 0)
            );
        }

        /* ---------------- DERIVE TEAM LEADER ---------------- */

        let teamleader = null;

        if (lead.assignedTo) {
            const assignedRole = mapRoleForApp(lead.assignedTo?.role?.role);

            if (assignedRole === "teamleader") {
                teamleader = lead.assignedTo;
            } else if (
                assignedRole === "counselor" &&
                lead.assignedTo.teamLeader
            ) {
                teamleader = lead.assignedTo.teamLeader;
            }
        }

        /* ---------------- FETCH LAST CONVERSATION ---------------- */

        const conversation = await LeadConversation.findOne({ lead_id: id })
            .select(`sessions.createdBy 
               sessions.createdAt 
               sessions.next_follow_up_date 
               sessions.next_follow_up_time`)
            .lean();

        let hasConversation = false;
        let lastConversationBy = null;
        let lastConversationAt = null;
        let nextFollowUp = null;

        if (conversation?.sessions?.length) {
            hasConversation = true;

            const lastSession = conversation.sessions.at(-1);

            lastConversationBy =
                typeof lastSession?.createdBy === "object"
                    ? lastSession.createdBy?._id
                    : lastSession?.createdBy;

            lastConversationAt = lastSession?.createdAt || null;

            if (lastSession?.next_follow_up_date) {
                nextFollowUp = {
                    date: lastSession.next_follow_up_date,
                    time: lastSession.next_follow_up_time || ""
                };
            }
        }

        /* ---------------- RESPONSE ---------------- */

        return res.status(200).json({
            ...lead,
            teamleader,
            hasConversation,
            lastConversationBy,
            lastConversationAt,
            nextFollowUp
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

        const authUser = await RegularUser.findById(authUserId)
            .select("_id name role organizationId")
            .lean();

        const organizationId = authUser?.organizationId;

        /* ------------------ Resolve Creator ------------------ */
        let userId = authUser._id;

        const marketingData = detectLeadSource(req);

        const sanitizedBody = sanitizePayload(req.body);

        const {
            name,
            email,
            contact,
            alternateContact,
            gender,
            dob,

            category,
            property_id,
            custom_property_name,
            course_id,
            custom_course_name,

            address = "",
            city = "",
            state = "",
            country = "",
            pincode = "",

            academics = {},
            preferences = {},
            school = {},
            exam = {},
        } = sanitizedBody;

        /* ------------------ Validation ------------------ */
        if (!name || !contact) {
            return res.status(400).json({
                error: "Name and contact are required",
            });
        }

        const sanitizedName = String(name).trim();
        const sanitizedEmail = email?.trim()?.toLowerCase() || "";

        if (sanitizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        /* ------------------ Normalize "Other" ------------------ */
        const normalizeOther = (obj = {}) => {
            const newObj = { ...obj };

            Object.keys(newObj).forEach((key) => {
                if (newObj[key] === "__other__") {
                    const otherKey = `${key}_other`;

                    if (newObj[otherKey]) {
                        newObj[key] = newObj[otherKey];
                    }

                    delete newObj[otherKey];
                }
            });

            return newObj;
        };

        const cleanPreferences = normalizeOther(preferences);

        const leadData = {};

        // ---------- COURSE ----------
        if (!course_id || course_id === "") {
            leadData.course_id = null;
            leadData.custom_course_name = "";
        }
        else if (course_id === "__other__") {
            if (!custom_course_name?.trim()) {
                return res.status(400).json({
                    error: "Custom course name is required"
                });
            }

            leadData.course_id = null;
            leadData.custom_course_name = custom_course_name.trim();
        }
        else {
            if (!mongoose.Types.ObjectId.isValid(course_id)) {
                return res.status(400).json({ error: "Invalid course id" });
            }

            leadData.course_id = course_id;
            leadData.custom_course_name = "";
        }

        // ---------- PROPERTY ----------
        if (!property_id || property_id === "") {
            leadData.property_id = null;
            leadData.custom_property_name = "";
        }
        else if (property_id === "__other__") {
            if (!custom_property_name?.trim()) {
                return res.status(400).json({
                    error: "Custom college name is required"
                });
            }

            leadData.property_id = null;
            leadData.custom_property_name = custom_property_name.trim();
        }
        else {
            if (!mongoose.Types.ObjectId.isValid(property_id)) {
                return res.status(400).json({ error: "Invalid property id" });
            }

            leadData.property_id = property_id;
            leadData.custom_property_name = "";
        }

        /* ------------------ Payload ------------------ */
        const leadPayload = {
            createdBy: userId,
            assignedTo: null,

            name: sanitizedName,
            email: sanitizedEmail || null,
            contact: contact?.trim(),
            alternateContact: alternateContact?.trim() || "",

            gender: sanitizeEnum(sanitizedBody.gender, GENDER_TYPES),
            dob: dob && !isNaN(new Date(dob))
                ? new Date(dob)
                : null,

            organizationId,
            category,

            ...leadData,

            address: address?.trim() || "",
            city: city?.trim() || "",
            state: state?.trim() || "",
            country: country?.trim() || "",
            pincode: pincode?.trim() || "",

            /* ---------- Academic ---------- */
            academics: {
                qualification: academics?.qualification?.trim() || "",
                boardOrUniversity: academics?.boardOrUniversity?.trim() || "",
                passingYear: academics?.passingYear || null,
                percentage: academics?.percentage || null,
                stream: academics?.stream || "",
            },

            /* ---------- School ---------- */
            school: {
                currentName: school?.currentName || "",
                currentLocation: school?.currentLocation || "",
                board: school?.board || "",
                currentClass: school?.currentClass || "",
                session: school?.session || "",
                percentage: school?.percentage || "",
            },

            /* ---------- Coaching ---------- */

            exam: {
                examType: Array.isArray(exam?.examType) ? exam.examType : [],
                location: exam?.location || "",
                mode: sanitizeEnum(
                    sanitizedBody?.exam?.mode,
                    EXAM_MODES
                ),
                batch: sanitizeEnum(
                    sanitizedBody?.exam?.batch,
                    EXAM_BATCHES
                ),
                hostel: sanitizeEnum(
                    sanitizedBody?.exam?.hostel,
                    HOSTEL_TYPES
                ),
                transport: sanitizeEnum(
                    sanitizedBody?.exam?.transport,
                    HOSTEL_TYPES
                ),
            },

            /* ---------- Preferences ---------- */
            preferences: {
                preferredProperty: cleanPreferences?.preferredProperty || null,
                preferredCourse: cleanPreferences?.preferredCourse || null,

                preferredCountry: cleanPreferences?.preferredCountry || "",
                preferredState: cleanPreferences?.preferredState || "",
                preferredCity: cleanPreferences?.preferredCity || "",

                preferredSchool: cleanPreferences?.preferredSchool || "",
                schoolType: cleanPreferences?.schoolType || "",
                location: cleanPreferences?.location || "",
                admissionClass: cleanPreferences?.admissionClass || "",
                session: cleanPreferences?.session || "",
                hostel: sanitizeEnum(
                    sanitizedBody?.preferences?.hostel,
                    HOSTEL_TYPES
                ),

                collegeType: sanitizeEnum(
                    sanitizedBody?.preferences?.collegeType,
                    COLLEGE_TYPES
                ) || "Any",
            },

            marketing: marketingData,
            leadType: "manual",
            lastActivity: new Date(),
        };

        /* ------------------ Create Lead ------------------ */
        const newLead = await Lead.create(leadPayload);

        /* ------------------ Notification ------------------ */
        await notifyLeadCreated({
            organizationId: authUser?.organizationId,
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
        // ---------- AUTH ----------
        const senderId = await getDataFromToken(req);

        if (!mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(401).json({ error: "Unauthorized user" });
        }

        const actor = await RegularUser.findById(senderId)
            .select("_id name role organizationId")
            .lean();

        if (!actor) {
            return res.status(404).json({ error: "User not found" });
        }

        // ---------- PARAM ----------
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid lead ID" });
        }

        const lead = await Lead.findById(id);
        if (!lead) {
            return res.status(404).json({ error: "Lead not found" });
        }

        const sanitizedBody = sanitizePayload(req.body);

        // ---------- BODY ----------
        const {
            name,
            email,
            contact,
            alternateContact,
            gender,
            dob,

            category,
            property_id,
            custom_property_name,
            course_id,
            custom_course_name,

            address = "",
            city = "",
            state = "",
            country = "",
            pincode = "",

            academics = {},
            preferences = {},
            school = {},
            exam = {},
        } = sanitizedBody;

        // ---------- CORE ----------
        if (name !== undefined) {
            const clean = String(name).trim();
            if (!clean) return res.status(400).json({ error: "Name required" });
            lead.name = clean;
        }

        // ---------- CONTACT ----------
        if (contact !== undefined) {
            const normalized = String(contact).replace(/\s/g, "");

            if (!/^(\+91)?[6-9]\d{9}$/.test(normalized)) {
                return res.status(400).json({ error: "Invalid contact number" });
            }

            lead.contact = normalized.trim();
        }

        // ---------- ALTERNATE CONTACT ----------
        if (alternateContact !== undefined) {

            // null / empty / undefined
            if (
                alternateContact === null ||
                alternateContact === ""
            ) {
                lead.alternateContact = "";
            }
            else {

                let normalized = String(alternateContact)
                    .replace(/\s/g, "")
                    .trim();

                normalized = normalized.replace(/^(\+91)+/, "+91");

                const digits = normalized.replace(/^\+91/, "");

                if (!/^[6-9]\d{9}$/.test(digits)) {
                    return res.status(400).json({
                        error: "Invalid alternate contact number"
                    });
                }

                lead.alternateContact = "+91" + digits;
            }
        }

        if (category && !mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                error: "Invalid category id"
            });
        }

        // ---------- GENDER ----------
        if (gender !== undefined) {
            lead.gender = sanitizeEnum(gender, GENDER_TYPES);
        }

        // ---------- DOB ----------
        if (dob !== undefined) {
            lead.dob = dob && !isNaN(new Date(dob)) ? new Date(dob) : null;
        }

        // ---------- ADDRESS ----------
        if (address !== undefined) lead.address = address || "";
        if (country !== undefined) lead.country = country || "";
        if (state !== undefined) lead.state = state || "";
        if (city !== undefined) lead.city = city || "";

        if (pincode !== undefined) {
            if (pincode && !/^\d{6}$/.test(pincode)) {
                return res.status(400).json({ error: "Invalid pincode" });
            }
            lead.pincode = pincode || "";
        }

        // ---------- COURSE (FINAL FIX) ----------
        if (course_id !== undefined) {

            // 🔴 EMPTY STRING FIX
            if (!course_id || course_id === "") {
                lead.course_id = null;
                lead.custom_course_name = "";
            }

            else if (course_id === "__other__") {
                if (!custom_course_name?.trim()) {
                    return res.status(400).json({
                        error: "Custom course name is required"
                    });
                }

                lead.course_id = null;
                lead.custom_course_name = custom_course_name.trim();
            }

            else {
                if (!mongoose.Types.ObjectId.isValid(course_id)) {
                    return res.status(400).json({ error: "Invalid course id" });
                }

                lead.course_id = course_id;
                lead.custom_course_name = "";
            }
        }

        // ---------- PROPERTY (FINAL FIX) ----------
        if (property_id !== undefined) {

            // 🔴 EMPTY STRING FIX
            if (!property_id || property_id === "") {
                lead.property_id = null;
                lead.custom_property_name = "";
            }

            else if (property_id === "__other__") {
                if (!custom_property_name?.trim()) {
                    return res.status(400).json({
                        error: "Custom college name is required"
                    });
                }

                lead.property_id = null;
                lead.custom_property_name = custom_property_name.trim();
            }

            else {
                if (!mongoose.Types.ObjectId.isValid(property_id)) {
                    return res.status(400).json({ error: "Invalid property id" });
                }

                lead.property_id = property_id;
                lead.custom_property_name = "";
            }
        }

        // ---------- ACADEMICS ----------
        if (academics && typeof academics === "object") {
            lead.academics = {
                ...lead.academics,
                qualification:
                    academics.qualification ?? lead.academics?.qualification,

                boardOrUniversity:
                    academics.boardOrUniversity ?? lead.academics?.boardOrUniversity,

                passingYear:
                    academics.passingYear ?? lead.academics?.passingYear,

                percentage:
                    academics.percentage ?? lead.academics?.percentage,

                stream:
                    academics.stream ?? lead.academics?.stream,
            };
        }

        // ---------- SCHOOL ----------
        if (req.body.school && typeof req.body.school === "object") {
            const school = req.body.school;

            lead.school = {
                ...lead.school, // ✅ keep existing data

                currentName:
                    school.currentName !== undefined
                        ? String(school.currentName || "").trim()
                        : lead.school?.currentName,

                currentLocation:
                    school.currentLocation !== undefined
                        ? String(school.currentLocation || "").trim()
                        : lead.school?.currentLocation,

                board:
                    school.board !== undefined
                        ? String(school.board || "").trim()
                        : lead.school?.board,

                currentClass:
                    school.currentClass !== undefined
                        ? String(school.currentClass || "").trim()
                        : lead.school?.currentClass,

                session:
                    school.session !== undefined
                        ? String(school.session || "").trim()
                        : lead.school?.session,

                percentage:
                    school.percentage !== undefined
                        ? school.percentage || null
                        : lead.school?.percentage
            };
        }

        // ---------- EXAM ----------
        if (exam && typeof exam === "object") {
            const normalizeArray = (val) => {
                if (!val) return [];
                if (Array.isArray(val)) return val.filter(Boolean);
                return [];
            };

            lead.exam = {
                ...lead.exam,

                examType: normalizeArray(exam.examType), // ✅ ARRAY SAFE

                location: exam.location !== undefined
                    ? String(exam.location || "").trim()
                    : lead.exam?.location,

                mode: exam.mode !== undefined
                    ? sanitizeEnum(exam.mode, EXAM_MODES)
                    : lead.exam?.mode,

                batch: exam.batch !== undefined
                    ? sanitizeEnum(exam.batch, EXAM_BATCHES)
                    : lead.exam?.batch,

                hostel: preferences.hostel !== undefined
                    ? sanitizeEnum(preferences.hostel, HOSTEL_TYPES)
                    : lead.preferences?.hostel,

                transport: exam.transport !== undefined
                    ? sanitizeEnum(exam.transport, HOSTEL_TYPES)
                    : lead.exam?.transport,
            };
        }

        // ---------- PREFERENCES ----------
        if (preferences && typeof preferences === "object") {
            lead.preferences = {
                ...lead.preferences,

                preferredProperty: preferences.preferredProperty ?? lead.preferences?.preferredProperty,
                preferredCourse: preferences.preferredCourse ?? lead.preferences?.preferredCourse,

                preferredCountry: preferences.preferredCountry ?? lead.preferences?.preferredCountry,
                preferredState: preferences.preferredState ?? lead.preferences?.preferredState,
                preferredCity: preferences.preferredCity ?? lead.preferences?.preferredCity,

                preferredSchool: preferences.preferredSchool ?? lead.preferences?.preferredSchool,
                schoolType: preferences.schoolType ?? lead.preferences?.schoolType,
                location: preferences.location ?? lead.preferences?.location,
                admissionClass: preferences.admissionClass ?? lead.preferences?.admissionClass,
                session: preferences.session ?? lead.preferences?.session,

                // ✅ FIX ENUM FIELDS
                hostel:
                    preferences.hostel !== undefined
                        ? sanitizeEnum(
                            preferences.hostel,
                            HOSTEL_TYPES
                        )
                        : lead.preferences?.hostel,

                mode:
                    preferences.mode !== undefined
                        ? sanitizeEnum(
                            preferences.mode,
                            EXAM_MODES
                        )
                        : lead.preferences?.mode,

                batch:
                    preferences.batch !== undefined
                        ? sanitizeEnum(
                            preferences.batch,
                            EXAM_BATCHES
                        )
                        : lead.preferences?.batch,

                transport:
                    preferences.transport !== undefined
                        ? sanitizeEnum(
                            preferences.transport,
                            HOSTEL_TYPES
                        )
                        : lead.preferences?.transport,

                collegeType:
                    preferences.collegeType !== undefined
                        ? sanitizeEnum(
                            preferences.collegeType,
                            COLLEGE_TYPES
                        ) || "Any"
                        : lead.preferences?.collegeType,
            };
        }

        // ---------- SAVE ----------
        await lead.save();

        return res.status(200).json({
            success: true,
            message: "Lead updated successfully",
            data: lead
        });

    } catch (err) {
        console.error("Update Lead Error:", err);
        return res.status(500).json({
            success: false,
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

        /* ---------------- AUTH ---------------- */

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await RegularUser.findById(userId)
            .populate("role", "role")
            .select("_id role name organizationId")
            .lean();

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const appRole = mapRoleForApp(user.role?.role); // ✅ FIX
        const userOrgId = user?.organizationId;

        // 🔐 Only allowed roles
        if (!["admin", "teamleader", "partner"].includes(appRole)) {
            return res.status(403).json({ error: "Access denied" });
        }

        /* ---------------- FILE VALIDATION ---------------- */

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        const allowedTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel"
        ];

        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ error: "Invalid file type" });
        }

        /* ---------------- PARSE EXCEL ---------------- */

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (!rows.length) {
            return res.status(400).json({ error: "Uploaded file is empty." });
        }

        const validLeads = [];
        const rejected = [];

        /* ---------------- PROCESS ROWS ---------------- */

        rows.forEach((row, index) => {
            const rowNum = index + 2;

            const lead = mapRowToLead(row, user);

            // 🔐 Basic sanitization
            if (lead.name) {
                lead.name = String(lead.name).trim();
            }

            if (!lead.name) {
                rejected.push({ row: rowNum, reason: "Missing Name" });
                return;
            }

            validLeads.push({
                ...lead,
                organizationId: userOrgId,
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

        /* ---------------- INSERT ---------------- */

        let insertedLeads = [];

        if (validLeads.length) {
            insertedLeads = await Lead.insertMany(validLeads, {
                ordered: false
            });
        }

        /* ---------------- NOTIFICATION ---------------- */

        if (insertedLeads.length) {
            try {
                await notifyLeadCreated({
                    organizationId: user.organizationId,
                    authUser: user,
                    leadIds: insertedLeads.map(l => l._id)
                });
            } catch (err) {
                console.error("Notification error:", err);
            }
        }

        /* ---------------- RESPONSE ---------------- */

        return res.status(200).json({
            success: true,
            message: `${insertedLeads.length} leads imported.`,
            insertedCount: insertedLeads.length,
            rejectedCount: rejected.length,
            rejected
        });

    } catch (error) {
        console.error("Bulk upload error:", error);

        return res.status(500).json({
            error: "Internal Server Error during import."
        });
    }
};

export const createPublicLead = async (req, res) => {
    try {
        const { name, email, contact, course, ref_code } = req.body || {};

        /* ---------------- VALIDATION ---------------- */

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

        /* ---------------- ROLE IDS ---------------- */

        const [partnerRoleId, adminRoleId] = await Promise.all([
            getRoleId("partner"),
            getRoleId("admin")
        ]);

        /* ---------------- RESOLVE PARTNER ---------------- */

        let partnerUser = null;
        let refApplied = false;

        if (ref_code) {
            partnerUser = await RegularUser.findOne({
                ref_code: String(ref_code).trim(),
                role: partnerRoleId
            })
                .select("_id name")
                .lean();

            if (partnerUser) refApplied = true;
        }

        /* ---------------- DUPLICATE CHECK ---------------- */

        const exists = await Lead.exists({
            $or: [
                { email: sanitizedEmail },
                { contact: sanitizedContact }
            ]
        });

        if (exists) {
            return res.status(200).json({
                message: "Lead already exists",
                refApplied
            });
        }

        /* ---------------- RESOLVE OWNER ---------------- */

        let createdBy = null;

        if (refApplied && partnerUser) {
            createdBy = partnerUser._id;
        } else {
            const admin = await RegularUser.findOne({
                role: adminRoleId
            })
                .select("_id")
                .lean();

            createdBy = admin?._id || null;
        }

        /* ---------------- CREATE LEAD ---------------- */

        const lead = await Lead.create({
            createdBy,
            assignedTo: null,

            name: sanitizedName,
            email: sanitizedEmail,
            contact: sanitizedContact,

            preferences: {
                courseName: course ? String(course).trim() : ""
            },

            leadType: refApplied ? "partner" : "external",
            source: "external_form",
            lastActivity: new Date(),
        });

        return res.status(201).json({
            message: "Lead created",
            leadId: lead._id,
            refApplied,
            partnerName: partnerUser?.name || null
        });

    } catch (err) {
        console.error("Public Lead Error:", err);

        return res.status(500).json({
            error: "Internal server error"
        });
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

        /* ---------------- VALIDATION ---------------- */

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

        /* ---------------- ROLE IDS ---------------- */

        const adminRoleId = await getRoleId("admin");

        /* ---------------- RESOLVE OWNER ---------------- */

        const admin = await RegularUser.findOne({ role: adminRoleId })
            .select("_id")
            .lean();

        if (!admin) {
            return res.status(500).json({
                error: "No admin configured in system",
            });
        }

        const adminId = admin._id;

        /* ---------------- DUPLICATE CHECK (IMPORTANT) ---------------- */

        const exists = await Lead.exists({
            $or: [
                { email: sanitizedEmail },
                { contact: sanitizedContact }
            ]
        });

        if (exists) {
            return res.status(200).json({
                success: true,
                message: "Lead already exists",
            });
        }

        /* ---------------- MARKETING ---------------- */

        const detectedMarketing = detectLeadSource(req);

        /* ---------------- PAYLOAD ---------------- */

        const leadPayload = {
            property_id,
            course_id,

            createdBy: adminId,
            assignedTo: null,

            name: sanitizedName,
            email: sanitizedEmail,
            contact: sanitizedContact,

            address: String(address).trim(),
            city: String(city || preferences?.preferredCity || "").trim(),
            state: String(state).trim(),
            pincode: String(pincode).trim(),

            academics: {
                qualification: String(academics?.qualification || "").trim(),
                boardOrUniversity: String(academics?.boardOrUniversity || "").trim(),
                passingYear: academics?.passingYear || null,
                percentage: academics?.percentage || null,
                stream: String(academics?.stream || "").trim(),
            },

            preferences: {
                courseName: preferences?.courseName
                    ? String(preferences.courseName).trim()
                    : undefined,

                courseType: sanitizeEnum(preferences?.courseType, COURSE_TYPES),

                specialization: preferences?.specialization
                    ? String(preferences.specialization).trim()
                    : undefined,

                preferredState: preferences?.preferredState
                    ? String(preferences.preferredState).trim()
                    : undefined,

                preferredCity: preferences?.preferredCity
                    ? String(preferences.preferredCity).trim()
                    : undefined,

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

        /* ---------------- CREATE ---------------- */

        const newLead = await Lead.create(leadPayload);

        /* ---------------- NOTIFICATION ---------------- */

        try {
            await notifyLeadCreated({
                authUser: null,
                leadIds: [newLead._id],
                leadName: newLead.name,
            });
        } catch (err) {
            console.error("Notification error:", err);
        }

        /* ---------------- RESPONSE ---------------- */

        return res.status(201).json({
            success: true,
            message: "Your enquiry has been submitted.",
            leadId: newLead._id,
        });

    } catch (err) {
        console.error("External Lead Error:", err);

        return res.status(500).json({
            error: "Internal server error",
        });
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