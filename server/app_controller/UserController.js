import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import RegularUser from "../profile-model/RegularUser.js";
import { ProfileRoles } from "../profile-model/ProfileRoles.js";
import { generateUniqueId } from "../utils/Callback.js";
import { sendAccessEmail } from "../email/mailer.js";
import { getRoleIds } from "../utils/profileRole.util.js";
import { getDataFromToken } from "../utils/getDataFromToken.js";
import UserInvite from "../profile-model/UserInvite.js";
import crypto from 'crypto';
import ProfileLocation from "../profile-model/ProfileLocation.js";

const normalizeMobile = (input = "") => {
    // remove all non-digits
    const digits = input.replace(/\D/g, "");

    // handle different cases
    let number = digits;

    if (digits.length === 10) {
        number = digits;
    } else if (digits.length === 12 && digits.startsWith("91")) {
        number = digits.slice(2);
    } else {
        throw new Error("Invalid mobile number format");
    }

    // final validation (Indian numbers)
    if (!/^[6-9][0-9]{9}$/.test(number)) {
        throw new Error("Invalid Indian mobile number");
    }

    return `+91${number}`;
};

// Add a USER
export const addUser = async (req, res) => {
    try {
        const adminId = await getDataFromToken(req);
        const admin = await RegularUser.findById(adminId).select("_id nicheId name").lean();
        const nicheId = admin?.nicheId;

        const { username, name, email, mobile_no: rawMobileNo, role } = req.body;
        const mobile_no = normalizeMobile(rawMobileNo);
        const sanitizedUsername = username?.toLowerCase().trim().replace(/\s+/g, "");

        if (!/^[a-z0-9]+$/.test(sanitizedUsername)) {
            throw new Error("Invalid username format");
        }

        if (!mongoose.Types.ObjectId.isValid(role)) {
            return res.status(400).json({ error: "Role not found." });
        }

        const roleData = await ProfileRoles.findById(role);

        const existEmail = await RegularUser.findOne({ email });
        if (existEmail) {
            return res.status(400).json({ error: "Email already exists." });
        }

        const existMobileNo = await RegularUser.findOne({ mobile_no });
        if (existMobileNo) {
            return res.status(400).json({ error: "Mobile number already exists." });
        }

        // PASSWORD GENERATION
        const generatePassword = () => {
            const chars =
                "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";
            return Array.from({ length: 10 }, () =>
                chars.charAt(Math.floor(Math.random() * chars.length))
            ).join("");
        };

        // PASSWORD
        const password = generatePassword();

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
                exists = await RegularUser.findOne({ ref_code: code });
            }

            return code;
        };

        let ref_code = undefined;
        if (roleData?.role === "Partner") {
            ref_code = await generateRefCode();
        }

        const uniqueId = await generateUniqueId(RegularUser);

        const newUser = new RegularUser({
            nicheId,
            uniqueId,
            username: sanitizedUsername,
            name,
            email,
            mobile_no,
            password: hashedPassword,
            role,
            ...(ref_code && { ref_code })
        });

        const savedUser = await newUser.save();

        // SEND ACCESS EMAIL
        await sendAccessEmail({ email, password, role: roleData?.role });

        const { password: _, ...safeUser } = savedUser._doc;

        return res.status(201).json({
            message: "User added successfully.",
            user: safeUser,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Update a User
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        let {
            username,
            name,
            email,
            mobile_no: rawMobileNo,
            role,
            verified
        } = req.body;

        /* ---------------- CONTACT NORMALIZATION ---------------- */
        const mobile_no = normalizeMobile(rawMobileNo);

        /* ---------------- BOOLEAN NORMALIZATION ---------------- */
        const normalizedVerified =
            verified === true || verified === "true";

        /* ---------------- UPDATE ---------------- */
        const updatedUser = await RegularUser.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...(name !== undefined && { name }),
                    ...(email !== undefined && { email }),
                    ...(mobile_no !== undefined && { mobile_no }),
                    ...(role !== undefined && { role }),
                    verified: normalizedVerified,
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

// Controller to fetch counselors and teamleaders
export const fetchCounselorsAndTeamleaders = async (req, res) => {
    try {
        // 1. Fetch both role IDs in parallel
        const [counselorRoleId, teamLeaderRoleId] = await Promise.all([
            getRoleIds("counselor"),
            getRoleIds("team leader") // make sure exact role name matches DB
        ]);

        // 2. Validate ObjectIds (defensive)
        if (
            !mongoose.Types.ObjectId.isValid(counselorRoleId) ||
            !mongoose.Types.ObjectId.isValid(teamLeaderRoleId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid role IDs"
            });
        }

        // 3. Fetch users in single query (better performance)
        const users = await RegularUser.find({
            role: { $in: [counselorRoleId, teamLeaderRoleId] }
        })
            .select("_id name email mobile_no status role teamLeader")
            .populate("role", "role") // ✅ get role name
            .populate("teamLeader", "name email")
            .lean();

        // 4. Split into groups (O(n), no extra DB calls)
        const counselors = [];
        const teamleaders = [];

        for (const user of users) {
            const roleId = user.role?._id?.toString();

            if (roleId === counselorRoleId) {
                counselors.push(user);
            } else if (roleId === teamLeaderRoleId) {
                teamleaders.push(user);
            }
        }

        return res.status(200).json({
            success: true,
            count: {
                counselors: counselors.length,
                teamleaders: teamleaders.length
            },
            data: {
                counselors,
                teamleaders
            }
        });
    } catch (error) {
        console.error("Error fetching counselors & teamleaders:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

// Controller to fetch admins
export const fetchAdmins = async (req, res) => {
    try {
        const adminRoleId = await getRoleIds("Property Manager");

        const admins = await RegularUser.find({ role: adminRoleId }).select("-password").lean();

        return res.status(200).json({
            success: true,
            users: admins, // 🔥 match frontend expectation
            total: admins.length
        });
    } catch (error) {
        console.error("Error fetching admins:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const fetchAdminById = async (req, res) => {
    try {
        const { id } = req.params;

        // ---------------- VALIDATION ----------------
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admin ID"
            });
        }

        const adminId = new mongoose.Types.ObjectId(id);

        // ---------------- ROLE RESOLVE ----------------
        let roleIds;
        try {
            const [adminRoleId, counselorRoleId, teamLeaderRoleId, partnerRoleId] =
                await getRoleIds(["Property Manager", "counselor", "team leader", "partner"]);

            roleIds = {
                adminRoleId,
                counselorRoleId,
                teamLeaderRoleId,
                partnerRoleId
            };
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: "Role resolution failed"
            });
        }

        // ---------------- FETCH ADMIN ----------------
        const admin = await RegularUser.findOne({
            _id: adminId,
            role: roleIds.adminRoleId
        })
            .select("-password -__v")
            .lean();

        // ---------------- NOT FOUND ----------------
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        // ---------------- PARALLEL FETCH ----------------
        const [partners, counselors, teamleaders, location] = await Promise.all([

            RegularUser.find({ role: roleIds.partnerRoleId })
                .select("_id name email mobile_no ref_code status isVerified")
                .lean(),

            RegularUser.find({ role: roleIds.counselorRoleId })
                .select("_id name email mobile_no status isVerified teamLeader")
                .populate("teamLeader", "name email")
                .lean(),

            RegularUser.find({ role: roleIds.teamLeaderRoleId })
                .select("_id name email mobile_no status isVerified")
                .lean(),

            ProfileLocation.findOne({ userId: admin?.uniqueId }).lean()
        ]);

        // ---------------- SUCCESS ----------------
        return res.status(200).json({
            success: true,
            data: {
                admin,
                partners,
                counselors,
                teamleaders,
                location: location || null
            }
        });

    } catch (error) {
        console.error("Error fetching admin:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Controller to fetch counselors
export const fetchCounselors = async (req, res) => {
    try {
        const counselorRoleId = await getRoleIds("counselor");

        const counselors = await RegularUser.find({ role: counselorRoleId })
            .populate("teamLeader", "name email") // ✅ IMPORTANT FIX
            .select("_id name email mobile_no status teamLeader verified")
            .lean();

        return res.status(200).json({
            success: true,
            count: counselors.length,
            data: counselors
        });
    } catch (error) {
        console.error("Error fetching counselors:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const fetchCounselorById = async (req, res) => {
    try {
        const { id } = req.params;

        // ---------------- VALIDATION ----------------
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid counselor ID" });
        }

        // ---------------- ROLE RESOLVE ----------------
        const counselorRoleId = await getRoleIds("Counselor");

        // ---------------- FETCH USER ----------------
        const counselor = await RegularUser.findOne({
            _id: id,
            role: counselorRoleId // ensure it's actually a counselor
        }).select("-password").lean();

        // ---------------- NOT FOUND ----------------
        if (!counselor) {
            return res.status(404).json({ success: false, message: "Counselor not found" });
        }

        // ---------------- SUCCESS ----------------
        return res.status(200).json({ success: true, data: counselor });
    } catch (error) {
        console.error("Error fetching counselor:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Controller to fetch teamLeader
export const fetchTeamLeader = async (req, res) => {
    try {
        const teamleaderRoleId = await getRoleIds("Team Leader");

        const teamleaders = await RegularUser.find({ role: teamleaderRoleId }).select("-password").lean();

        return res.status(200).json({
            success: true,
            count: teamleaders.length,
            data: teamleaders
        });
    } catch (error) {
        console.error("Error fetching team leaders:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const fetchTeamLeaderById = async (req, res) => {
    try {
        const { id } = req.params;

        // ---------------- VALIDATION ----------------
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid team leader ID" });
        }

        // ---------------- ROLE RESOLVE ----------------
        const teamleaderRoleId = await getRoleIds("Team Leader");

        // ---------------- FETCH USER ----------------
        const teamleader = await RegularUser.findOne({
            _id: id,
            role: teamleaderRoleId // ensure it's actually a team leader
        }).select("-password").lean();

        // ---------------- NOT FOUND ----------------
        if (!teamleader) {
            return res.status(404).json({ success: false, message: "team leader not found" });
        }

        // ---------------- SUCCESS ----------------
        return res.status(200).json({ success: true, data: teamleader });
    } catch (error) {
        console.error("Error fetching team leader:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Controller to fetch Partner
export const fetchPartner = async (req, res) => {
    try {
        const partnerRoleId = await getRoleIds("partner");

        const partners = await RegularUser.find({ role: partnerRoleId }).select("-password").lean();

        return res.status(200).json({
            success: true,
            count: partners.length,
            data: partners
        });
    } catch (error) {
        console.error("Error fetching partners:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const fetchPartnerById = async (req, res) => {
    try {
        const { id } = req.params;

        // ---------------- VALIDATION ----------------
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid partner ID" });
        }

        // ---------------- ROLE RESOLVE ----------------
        const partnerRoleId = await getRoleIds("partner");

        // ---------------- FETCH USER ----------------
        const partner = await RegularUser.findOne({
            _id: id,
            role: partnerRoleId // ensure it's actually a partner
        }).select("-password").lean();

        // ---------------- NOT FOUND ----------------
        if (!partner) {
            return res.status(404).json({ success: false, message: "Partner not found" });
        }

        // ---------------- SUCCESS ----------------
        return res.status(200).json({ success: true, data: partner });
    } catch (error) {
        console.error("Error fetching partner:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
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

        const user = await RegularUser.findById(id).select("status");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 🔒 Toggle enum safely
        const newStatus = user.status === "Active" ? "Suspended" : "Active";
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

// Invite the Partner
export const getPartnerInvite = async (req, res) => {
    try {
        const adminId = await getDataFromToken(req);

        const partnerRoleId = await getRoleIds("Partner");

        const invite = await UserInvite.findOne({
            role: partnerRoleId,
            createdBy: adminId,
            expiresAt: { $gt: new Date() }
        }).lean();

        if (!invite) {
            return res.status(200).json({ inviteLink: null });
        }

        const inviteLink = `${process.env.LMS_FRONT_URL}/partner/register/${invite.token}`;

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
        const now = new Date();

        const partnerRoleId = await getRoleIds("Partner");

        // check existing invite
        const existingInvite = await UserInvite.findOne({
            role: partnerRoleId,
            createdBy: adminId,
            expiresAt: { $gt: now },
        }).lean();

        if (existingInvite) {
            return res.status(200).json({
                inviteLink: `${process.env.LMS_FRONT_URL}/partner/register/${existingInvite.token}`,
                reused: true,
            });
        }

        const token = crypto.randomBytes(32).toString("hex");

        const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

        await UserInvite.create({
            role: partnerRoleId,
            token,
            expiresAt,
            createdBy: adminId,
        });

        return res.status(200).json({
            inviteLink: `${process.env.LMS_FRONT_URL}/partner/register/${token}`,
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
        const { username, name, email, mobile_no: rawMobileNo, password } = req.body;

        const mobile_no = normalizeMobile(rawMobileNo);

        if (!token) {
            return res.status(400).json({ error: "Invalid invite token" });
        }

        const partnerRoleId = await getRoleIds("Partner");

        const invite = await UserInvite.findOne({
            token,
            role: partnerRoleId,
            expiresAt: { $gt: new Date() },
        });

        if (!invite) {
            return res.status(400).json({ error: "Invite link expired or invalid" });
        }

        const createdByAdmin = await RegularUser.findById({ _id: invite?.createdBy }).select("name email nicheId");
        const adminNicheId = createdByAdmin?.nicheId;

        // ---------------- VALIDATION ----------------
        if (await RegularUser.exists({ email })) {
            return res.status(400).json({ error: "Email already exists" });
        }

        if (await RegularUser.exists({ mobile_no })) {
            return res.status(400).json({ error: "Mobile number already exists" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        // ---------------- REF CODE ----------------
        const generateRefCode = async () => {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let code, exists = true;

            while (exists) {
                code = Array.from({ length: 6 }, () =>
                    chars[Math.floor(Math.random() * chars.length)]
                ).join("");

                exists = await RegularUser.exists({ ref_code: code });
            }
            return code;
        };

        const ref_code = await generateRefCode();

        const uniqueId = await generateUniqueId(RegularUser);

        // ---------------- CREATE USER ----------------
        const newUser = await RegularUser.create({
            nicheId: adminNicheId,
            uniqueId,
            username,
            name,
            email,
            mobile_no,
            password: hashedPassword,
            role: partnerRoleId,
            ref_code,
        });

        // invalidate invite
        await invite.deleteOne();

        return res.status(201).json({
            message: "Partner registered successfully",
            userId: newUser._id,
        });
    } catch (err) {
        console.error("Register Partner Error:", err);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};