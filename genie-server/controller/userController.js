import User from "../models/userModel.js";
import Permission from "../models/permissionModel.js";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { sendAccessEmail } from "../helper/mailer.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import BankDetails from "../models/bankDetailsModel.js";
import Documents from "../models/documentsModel.js";
import Location from "../models/locationModel.js";
import StudentLead from "../models/leadsModel.js";
import fetch from "node-fetch";
import UserInvite from "../models/userInviteModel.js";
import crypto from 'crypto';
import Lead from "../models/leadsModel.js";
import { createNotification } from "../services/notification.service.js";

// Utility to fetch users with role filtering
export const getUsersByRole = async ({ role = null, search = "" }) => {
    try {
        const query = {};

        if (role) query.role = role;

        /* ================= SECURITY: ReDoS Mitigation ================= */
        const sanitizedSearch = String(search || "").trim();

        if (sanitizedSearch) {
            const safeSearch = sanitizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            query.$or = [
                { name: { $regex: safeSearch, $options: "i" } },
                { email: { $regex: safeSearch, $options: "i" } },
                { contact: { $regex: safeSearch, $options: "i" } }
            ];
        }

        const users = await User.find(query)
            .select("-password -forgotOrResetPasswordToken -forgotOrResetPasswordTokenExpiry")
            .lean();

        return {
            users,
            total: users.length
        };
    } catch (error) {
        console.error("Error in getUsersByRole:", error);
        throw new Error("Failed to fetch users by role. Database query aborted.");
    }
};

// Controller to fetch all admins
export const fetchMyAdmins = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const search = req.query.search || "";

        const result = await getUsersByRole({
            role: "admin",
            page,
            limit,
            search
        });
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching admins:", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

// Controller to fetch all users
export const fetchAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching all users:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Controller to fetch admins
export const fetchAdmins = async (req, res) => {
    try {
        const users = await getUsersByRole("admin");
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching admins:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const fetchAdminById = async (req, res) => {
    try {
        const { uniqueId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(uniqueId)) {
            return res.status(400).json({ error: "Invalid admin ID" });
        }

        const admin = await User.findOne({ _id: uniqueId, role: "admin" }).select("-password");

        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        return res.status(200).json(admin);
    } catch (error) {
        console.error("Error fetching admin by ID:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Controller to fetch counselors
export const fetchCounselors = async (req, res) => {
    try {
        const { search = "" } = req.query;

        const result = await getUsersByRole({
            role: "counselor",
            search
        });

        return res.status(200).json(result); // { users, total }
    } catch (error) {
        console.error("Error fetching counselors:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const fetchCounselorById = async (req, res) => {
    try {
        const { uniqueId } = req.params;

        // ---------------- VALIDATION ----------------
        if (!mongoose.Types.ObjectId.isValid(uniqueId)) {
            return res.status(400).json({ success: false, message: "Invalid counselor ID" });
        }

        const userId = new mongoose.Types.ObjectId(uniqueId);

        // ---------------- FETCH COUNSELOR ----------------
        const counselor = await User.findOne({
            _id: userId,
            role: "counselor"
        }).select("-password").lean();

        if (!counselor) {
            return res.status(404).json({ success: false, message: "Counselor not found" });
        }

        // ---------------- PARALLEL STATS ----------------
        const [assignedLeads, createdLeads, totalLeads] = await Promise.all([

            // ✅ Only assigned (exclude self-created to avoid overlap)
            Lead.countDocuments({
                assignedTo: userId,
                createdBy: { $ne: userId }
            }),

            // ✅ Created leads
            Lead.countDocuments({
                createdBy: userId
            }),

            // ✅ UNIQUE TOTAL (NO DUPLICATION)
            Lead.countDocuments({
                $or: [
                    { assignedTo: userId },
                    { createdBy: userId }
                ]
            })
        ]);

        // ---------------- RESPONSE ----------------
        return res.status(200).json({
            success: true,
            data: {
                ...counselor,
                stats: {
                    assignedLeads,
                    createdLeads,
                    totalLeads // ✅ now matches UI (7)
                }
            }
        });
    } catch (error) {
        console.error("Error fetching counselor:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Controller to fetch partner
export const fetchPartners = async (req, res) => {
    try {
        const { search = "" } = req.query;

        const result = await getUsersByRole({
            role: "partner",
            search
        });

        return res.status(200).json(result); // { users, total }
    } catch (error) {
        console.error("Error fetching partners:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const fetchPartnerById = async (req, res) => {
    try {
        const { uniqueId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(uniqueId)) {
            return res.status(400).json({ error: "Invalid partner ID" });
        }

        const partner = await User.findOne({ _id: uniqueId, role: "partner" }).select("-password");

        if (!partner) {
            return res.status(404).json({ error: "Partner not found" });
        }

        return res.status(200).json(partner);
    } catch (error) {
        console.error("Error fetching partner by ID:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Controller to fetch team leader
export const fetchTeamLeader = async (req, res) => {
    try {
        const result = await getUsersByRole({ role: "teamleader" });

        const usersWithCount = await Promise.all(
            result.users.map(async (tl) => {
                const count = await User.countDocuments({
                    role: "counselor",
                    teamLeader: tl._id
                });

                return {
                    ...tl,
                    counselorCount: count
                };
            })
        );

        return res.status(200).json({
            users: usersWithCount,
            total: usersWithCount.length
        });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const fetchTeamLeaderById = async (req, res) => {
    try {
        const { uniqueId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(uniqueId)) {
            return res.status(400).json({ error: "Invalid team leader ID" });
        }

        const teamleader = await User.findOne({ _id: uniqueId, role: "teamleader" }).select("-password");

        if (!teamleader) {
            return res.status(404).json({ error: "Team leader not found" });
        }

        return res.status(200).json(teamleader);
    } catch (error) {
        console.error("Error fetching team leader by ID:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// All Users except superadmin
export const fetchUsers = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);

        // 🔐 Validate userId
        if (!mongoose.Types.ObjectId.isValid(authUserId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const authUser = await User.findById(authUserId)
            .select("_id role")
            .lean();

        // 🔐 Only admin can fetch all users
        if (!authUser || authUser.role !== "admin") {
            return res.status(403).json({ error: "Access denied" });
        }

        // ✅ Fetch all users except superadmin
        const users = await User.find({
            role: { $ne: "superadmin" }
        })
            .select("-password -forgotOrResetPasswordToken -forgotOrResetPasswordTokenExpiry")
            .lean();

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });

    } catch (error) {
        console.error("Fetch Users Error:", error);
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
};

// Toggle User's Status
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "User id is required" });
        }

        const user = await User.findById(id).select("status");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 🔒 Toggle enum safely
        const newStatus = user.status === "active" ? "suspended" : "active";
        user.status = newStatus;

        await user.save();

        return res.status(200).json({
            success: true,
            status: newStatus,
        });
    } catch (error) {
        console.error("Error toggling status:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

// Controller to fetch all permissions
export const fetchAllPermissions = async (req, res) => {
    try {
        const Permissions = await Permission.find().lean();
        return res.status(200).json(Permissions);
    } catch (error) {
        console.error("Error fetching all permissoins:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Add User
export const addUser = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const { name, email, contact: rawContact, role } = req.body;
        const contact = rawContact.replace(/\s/g, "");

        const allowedRoles = ["teamleader", "counselor"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ error: "Invalid role." });
        }

        const existEmail = await User.findOne({ email });
        if (existEmail) {
            return res.status(400).json({ error: "Email already exists." });
        }

        const existContact = await User.findOne({ contact });
        if (existContact) {
            return res.status(400).json({ error: "Contact number already exists." });
        }

        /* ============================
           PASSWORD GENERATION (PROD)
           ============================
        ============================ */
        const generatePassword = () => {
            const chars =
                "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";
            return Array.from({ length: 10 }, () =>
                chars.charAt(Math.floor(Math.random() * chars.length))
            ).join("");
        };

        // PASSWORD
        // const password = generatePassword();
        // TESTING MODE PASSWORD
        const password = "123456";


        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const generateRefCode = async () => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code;
            let exists = true;

            while (exists) {
                code = Array.from({ length: 6 }, () =>
                    characters.charAt(Math.floor(Math.random() * characters.length))
                ).join('');
                exists = await User.findOne({ ref_code: code });
            }

            return code;
        };

        let ref_code = undefined;
        if (role === "partner") {
            ref_code = await generateRefCode();
        }

        const newUser = new User({
            name,
            email,
            contact,
            password: hashedPassword,
            role,
            ...(ref_code && { ref_code })
        });

        const savedUser = await newUser.save();

        /* ============================
           SEND ACCESS EMAIL (PROD)
           ============================
        ============================ */
        // await sendAccessEmail({ email, password, role });

        // 🚫 MAIL DISABLED IN TESTING MODE

        const { password: _, ...safeUser } = savedUser._doc;

        return res.status(201).json({
            message: "User added successfully.",
            user: safeUser,
            testPassword: password // optional: remove in prod
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Update User
export const updateUser = async (req, res) => {
    try {
        const { uniqueId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(uniqueId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        let {
            name,
            email,
            contact,
            bio,
            role,
            permission,
            isVerified
        } = req.body;

        /* ---------------- CONTACT NORMALIZATION ---------------- */
        if (contact !== undefined) {
            let digits = String(contact).replace(/\D/g, ""); // remove all non-digits

            // handle Indian numbers with country code (e.g. +91XXXXXXXXXX)
            if (digits.length === 12 && digits.startsWith("91")) {
                digits = digits.slice(2);
            }

            // handle numbers like 0091XXXXXXXXXX
            if (digits.length === 14 && digits.startsWith("0091")) {
                digits = digits.slice(4);
            }

            // final validation (India mobile rule)
            if (!/^[6-9]\d{9}$/.test(digits)) {
                return res.status(400).json({
                    error: "Enter a valid 10-digit Indian mobile number",
                });
            }

            contact = digits; // store clean 10-digit format
        }

        /* ---------------- BOOLEAN NORMALIZATION ---------------- */
        const normalizedIsVerified =
            isVerified === true || isVerified === "true";

        /* ---------------- UPDATE ---------------- */
        const updatedUser = await User.findByIdAndUpdate(
            uniqueId,
            {
                $set: {
                    ...(name !== undefined && { name }),
                    ...(email !== undefined && { email }),
                    ...(contact !== undefined && { contact }),
                    ...(bio !== undefined && { bio }),
                    ...(role !== undefined && { role }),
                    ...(permission !== undefined && { permission }),
                    isVerified: normalizedIsVerified,
                },
            },
            {
                new: true,
                runValidators: true,
                context: "query", // ensures schema validators run correctly
            }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
            message: "User updated successfully.",
            updatedUser,
        });

    } catch (error) {
        console.error("Update User Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Delete User
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const userId = user._id;

        // 🔹 Delete common data
        await Location.deleteOne({ userId });

        if (["partner", "teamleader", "counselor"].includes(user.role)) {
            await Documents.deleteOne({ userId });
            await BankDetails.deleteOne({ userId });
        }

        await User.deleteOne({ _id: userId });

        return res.status(200).json({
            message: "User and related data deleted successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Delete Multiple User
export const deleteMultiUser = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "No user IDs provided." });
        }

        const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({ error: "One or more IDs are invalid.", invalidIds });
        }

        const result = await User.deleteMany({ _id: { $in: ids } });

        return res.status(200).json({
            message: `Successfully deleted ${result.deletedCount} user(s).`,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Counselor's Activity Tracker
export const activityTracker = async (req, res) => {
    try {
        const { activeSeconds } = req.body;
        const counselorId = await getDataFromToken(req);

        if (!mongoose.Types.ObjectId.isValid(counselorId)) {
            return res.status(400).json({ error: "Invalid counselor ID" });
        }

        const counselor = await User.findById(counselorId);
        if (!counselor) {
            return res.status(404).json({ error: "Counselor not found" });
        }

        // Update total active seconds
        counselor.totalActiveSeconds = (counselor.totalActiveSeconds || 0) + activeSeconds;

        // Create new session log
        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-GB"); // DD/MM/YYYY
        const formattedTime = now.toLocaleTimeString("en-GB"); // HH:MM:SS

        counselor.activityLogs.push({
            date: formattedDate,
            time: formattedTime,
            seconds: activeSeconds
        });

        await counselor.save();

        res.json({ success: true });
    } catch (error) {
        console.error("Error in Activity tracker:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// AI Chatbot
export const aiChatBot = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== "string") {
            return res.status(400).json({ error: "Valid message required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
        }

        const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
        const normalized = message.toLowerCase().trim();

        // ---------- GREETING ----------
        if (["hi", "hello", "hey"].includes(normalized)) {
            return res.json({
                reply: "Hello 👋 Ask me about leads, users, applications or insights."
            });
        }

        // ---------- DEFAULT PARSED ----------
        let parsed = {
            entity: "leads",
            intent: "list",
            filters: {}
        };

        // ---------- RULE-BASED INTENT ----------
        if (normalized.includes("how many") || normalized.includes("count")) {
            parsed.intent = "count";
        }

        if (normalized.includes("user") || normalized.includes("admin")) {
            parsed.entity = "users";
        }

        if (normalized.includes("conversation")) {
            parsed.entity = "conversations";
        }

        if (normalized.includes("application")) {
            parsed.entity = "applications";
        }

        if (normalized.includes("trend")) {
            parsed.intent = "trend";
        }

        if (normalized.includes("recent") || normalized.includes("latest")) {
            parsed.filters.days = 7;
        }

        // ---------- STATUS MAPPING ----------
        const statusMap = {
            contacted: "contacted",
            converted: "application_done",
            completed: "application_done",
            new: "new",
            lost: "lost"
        };

        Object.entries(statusMap).forEach(([key, value]) => {
            if (normalized.includes(key)) {
                parsed.filters.status = value;
            }
        });

        const { entity, intent, filters } = parsed;

        // ---------- BUILD QUERY ----------
        const query = {};

        if (filters.status) query.status = filters.status;

        if (filters.days) {
            query.createdAt = {
                $gte: new Date(Date.now() - filters.days * 86400000)
            };
        }

        let data = [];

        // ---------- FETCH ----------
        switch (entity) {
            case "users":
                data = await User.find(query)
                    .select("name role createdAt")
                    .limit(50)
                    .lean();
                break;

            case "applications":
                data = await Application.find(query)
                    .select("studentId status createdAt")
                    .limit(50)
                    .lean();
                break;

            case "conversations":
                data = await Conversation.find(query)
                    .select("leadId message createdAt")
                    .limit(50)
                    .lean();
                break;

            default:
                data = await StudentLead.find(query)
                    .select("name city status createdAt")
                    .sort({ createdAt: -1 })
                    .limit(50)
                    .lean();
        }

        // ---------- COUNT ----------
        if (intent === "count") {
            let total = 0;

            switch (entity) {
                case "users":
                    total = await User.countDocuments(query);
                    break;
                case "applications":
                    total = await Application.countDocuments(query);
                    break;
                case "conversations":
                    total = await Conversation.countDocuments(query);
                    break;
                default:
                    total = await StudentLead.countDocuments(query);
            }

            return res.json({
                reply: `Total ${filters.status ? filters.status + " " : ""}${entity}: ${total}`
            });
        }

        // ---------- NO DATA ----------
        if (!data.length) {
            return res.json({ reply: "No matching data found." });
        }

        // ---------- TREND ----------
        if (intent === "trend" && entity === "leads") {
            const trends = await StudentLead.aggregate([
                { $match: query },
                { $group: { _id: "$city", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);

            const reply = trends
                .map(t => `${t._id}: ${t.count}`)
                .join("\n");

            return res.json({ reply });
        }

        // ---------- CLEAN FORMAT (NO AI NEEDED 🔥) ----------
        const reply = data
            .slice(0, 10)
            .map((item) => {
                if (entity === "users") {
                    return `• ${item.name} (${item.role})`;
                }

                if (entity === "applications") {
                    return `• ${item.studentId} - ${item.status}`;
                }

                return `• ${item.name} - ${item.city || ""} - ${item.status || ""}`;
            })
            .join("\n");

        return res.json({ reply });

    } catch (err) {
        console.error("AI ERROR:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getAdminOverview = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid admin ID" });
        }

        const adminId = new mongoose.Types.ObjectId(id);

        // 🔐 Validate admin
        const admin = await User.findOne({
            _id: adminId,
            role: "admin"
        })
            .select("name email contact status isVerified profile_image profile_image_compressed createdAt updatedAt bio")
            .lean();

        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        /* ================= PARALLEL FETCH ================= */
        const [partners, counselors, teamleaders, location] = await Promise.all([

            User.find({ role: "partner" })
                .select("_id name email contact status isVerified ref_code")
                .lean(),

            User.find({ role: "counselor" })
                .select("_id name email contact status isVerified")
                .lean(),

            User.find({ role: "teamleader" })
                .select("_id name email contact status isVerified")
                .lean(),

            // ✅ FIXED: use model instead of raw connection
            Location.findOne({ userId: adminId }).lean()
        ]);

        return res.status(200).json({
            ...admin,
            partners,
            counselors,
            teamleaders,
            location: location || null
        });

    } catch (error) {
        console.error("Admin overview error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getAssignableUsers = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);

        if (!mongoose.Types.ObjectId.isValid(authUserId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const admin = await User.findById(authUserId)
            .select("_id role")
            .lean();

        // 🔐 STRICT ADMIN CHECK
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ error: "Access denied" });
        }

        // ✅ NO dependency
        const users = await User.find({
            role: { $in: ["teamleader", "counselor"] }
        })
            .select("_id name role email")
            .lean();

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error("Assignable Users Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getCounselorsForTeamLeader = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);

        const teamLeader = await User.findById(authUserId).select("role");
        if (!teamLeader || teamLeader.role !== "teamleader") {
            return res.status(403).json({ error: "Access denied" });
        }

        const counselors = await User.find({
            role: "counselor",
            teamLeader: authUserId
        }).select("_id name role email");

        return res.status(200).json(counselors);

    } catch (error) {
        console.error("TeamLeader Counselors Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Invite the Partner
export const getPartnerInvite = async (req, res) => {
    try {
        const adminId = await getDataFromToken(req);

        const admin = await User.findById(adminId).lean();

        if (!["admin", "superadmin"].includes(admin.role)) {
            return res.status(403).json({
                error: "Unauthorized"
            });
        }

        const invite = await UserInvite.findOne({
            role: "partner",
            createdBy: adminId,
            expiresAt: { $gt: new Date() }
        }).lean();

        if (!invite) {
            return res.status(200).json({
                inviteLink: null
            });
        }

        const inviteLink = `${process.env.DASHBOARD_URL}/partner/register/${invite.token}`;

        return res.status(200).json({
            inviteLink,
            expiresAt: invite.expiresAt
        });

    } catch (error) {
        console.error("Get Partner Invite Error:", error);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

// Generate the Partner Invite
export const generatePartnerInvite = async (req, res) => {
    try {
        const adminId = await getDataFromToken(req);

        const admin = await User.findById(adminId).lean();

        if (!["admin", "superadmin"].includes(admin.role)) {
            return res.status(403).json({
                error: "Unauthorized",
            });
        }

        const now = new Date();

        // check existing non-expired invite
        const existingInvite = await UserInvite.findOne({
            role: "partner",
            createdBy: adminId,
            expiresAt: { $gt: now },
        }).lean();

        if (existingInvite) {
            const inviteLink = `${process.env.DASHBOARD_URL}/partner/register/${existingInvite.token}`;

            return res.status(200).json({
                inviteLink,
                reused: true,
            });
        }

        // generate secure token
        const token = crypto.randomBytes(32).toString("hex");

        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3); // 3 days

        await UserInvite.create({
            role: "partner",
            token,
            expiresAt,
            createdBy: adminId,
        });

        const inviteLink = `${process.env.DASHBOARD_URL}/partner/register/${token}`;

        return res.status(200).json({
            inviteLink,
            reused: false,
        });
    } catch (error) {
        console.error("Generate Invite Error:", error);

        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
};

// Register the Partner via Invite Link
export const registerPartnerViaInvite = async (req, res) => {
    try {
        const { token } = req.params;
        const { name, email, contact, password } = req.body;

        if (!token) {
            return res.status(400).json({ error: "Invalid invite token" });
        }

        const invite = await UserInvite.findOne({
            token,
            role: "partner",
            expiresAt: { $gt: new Date() },
        });

        if (!invite) {
            return res.status(400).json({ error: "Invite link expired or invalid" });
        }

        // uniqueness checks
        if (await User.exists({ email })) {
            return res.status(400).json({ error: "Email already exists" });
        }
        if (await User.exists({ contact })) {
            return res.status(400).json({ error: "Contact already exists" });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // generate unique ref_code (partner only)
        const generateRefCode = async () => {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let code, exists = true;

            while (exists) {
                code = Array.from({ length: 6 }, () =>
                    chars[Math.floor(Math.random() * chars.length)]
                ).join("");
                exists = await User.exists({ ref_code: code });
            }
            return code;
        };

        const ref_code = await generateRefCode();

        const newUser = await User.create({
            name,
            email,
            contact,
            password: hashedPassword,
            role: "partner",
            ref_code,
        });

        // invalidate invite after use
        await invite.deleteOne();

        /* ------------------ NOTIFICATION ------------------ */
        try {
            const admins = await User.find({
                role: "admin",
            }).select("_id");

            if (admins?.length) {
                await Promise.all(
                    admins.map((admin) =>
                        createNotification({
                            receiverId: admin._id,                // New field name
                            senderId: newUser._id,               // The new partner
                            type: "partner_registered",
                            title: "New Partner Registered",
                            message: `${name} has joined as a partner.`,
                            link: `/dashboard/users/partners/view/${newUser._id}`,
                            meta: {
                                partnerId: newUser._id,
                                ref_code,
                            },
                        })
                    )
                );
            }
        } catch (notifErr) {
            console.error("Partner registration notification failed:", notifErr);
        }

        return res.status(201).json({
            message: "Partner registered successfully",
            userId: newUser._id,
        });
    } catch (err) {
        console.error("Register Partner Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Become a Partner
export const becomeAPartner = async (req, res) => {
    try {
        const { name, email, contact, password } = req.body;

        const admin = await User.findOne({ role: "admin" })
            .select("name role")
            .lean();

        // uniqueness checks
        if (await User.exists({ email })) {
            return res.status(400).json({ error: "Email already exists" });
        }
        if (await User.exists({ contact })) {
            return res.status(400).json({ error: "Contact already exists" });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // generate unique ref_code (partner only)
        const generateRefCode = async () => {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let code, exists = true;

            while (exists) {
                code = Array.from({ length: 6 }, () =>
                    chars[Math.floor(Math.random() * chars.length)]
                ).join("");
                exists = await User.exists({ ref_code: code });
            }
            return code;
        };

        const ref_code = await generateRefCode();

        const newUser = await User.create({
            name,
            email,
            contact,
            password: hashedPassword,
            role: "partner",
            ref_code,
        });

        /* ------------------ NOTIFICATION ------------------ */
        try {
            const admins = await User.find({
                role: "admin",
            }).select("_id");

            if (admins?.length) {
                await Promise.all(
                    admins.map((admin) =>
                        createNotification({
                            receiverId: admin._id,                // New field name
                            senderId: newUser._id,               // The new partner
                            type: "partner_registered",
                            title: "New Partner Registered",
                            message: `${name} has joined as a partner.`,
                            link: `/dashboard/users/partners/view/${newUser._id}`,
                            meta: {
                                partnerId: newUser._id,
                                ref_code,
                            },
                        })
                    )
                );
            }
        } catch (notifErr) {
            console.error("Partner registration notification failed:", notifErr);
        }

        return res.status(201).json({
            message: "Partner registered successfully",
            userId: newUser._id,
        });
    } catch (err) {
        console.error("Register Partner Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};