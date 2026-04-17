import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import { sendVerifyEmail, sendResetEmail } from "../helper/mailer.js";
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { googleClient } from "../config/googleClient.js";
import { createNotification } from "../services/notification.service.js";
import { normalizeIndianPhone } from "../utils/normalizePhone.js";
import Niche from "../models/niche.js";

const ensureDirectoryExistence = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const signToken = (userId) =>
    jwt.sign({ id: userId }, process.env.SECRET_TOKEN, {
        expiresIn: "7d",
    });

// Authentication
export const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: "Google credential missing" });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload?.email_verified) {
            return res.status(401).json({ error: "Google email not verified" });
        }

        const { sub: googleId, email, name, picture } = payload;

        let user = await User.findOne({ email });

        // 🆕 New user
        if (!user) {
            user = await User.create({
                name,
                email,
                googleId,
                provider: "google",
                isVerified: true,
                profile_image: picture,
                status: "active",
                role: "admin",
                lastLoginAt: new Date(),
            });

            // 🔔 Notify Superadmins about new Google Registration
            const superadmins = await User.find({ role: "superadmin" }).select("_id");
            if (superadmins.length > 0) {
                const adminData = user; // local reference
                await Promise.all(superadmins.map(sa =>
                    createNotification({
                        receiverId: sa._id,
                        senderId: adminData._id,
                        type: "admin_registered",
                        title: "New Google Admin",
                        message: `${adminData.name} joined via Google`,
                        link: `/dashboard/admins/view/${adminData._id}`,
                        meta: { adminId: adminData._id }
                    })
                ));
            }
        }

        // 🔗 Existing local user → link google
        else if (!user.googleId) {
            user.googleId = googleId;
            user.provider = "hybrid"; // now valid after enum fix
            user.profile_image = user.profile_image || picture;
            user.isVerified = true;
            user.status = "active"; // ensure valid enum
            user.lastLoginAt = new Date(); // ✅ FIX
            await user.save();
        }

        else {
            user.lastLoginAt = new Date(); // ✅ FIX (IMPORTANT)
            await user.save();
        }

        if (user.status === "suspended") {
            return res.status(403).json({
                error: "Account suspended. Contact support.",
            });
        }

        const token = signToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
            message: "Google authentication successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                provider: user.provider,
            },
        });
    } catch (err) {
        console.error("Google Auth Error:", err);
        return res.status(500).json({ error: "Google authentication failed" });
    }
};

export const register = async (req, res) => {
    try {
        const niche = await Niche.findOne();
        const nicheId = niche?._id;

        const { name, email, contact, password } = req.body || {};

        // 🔒 Basic validation
        if (!name || !email || !contact || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedContact = String(contact).replace(/\D/g, ""); // keep digits only

        if (normalizedContact.length !== 10) {
            return res.status(400).json({ error: "Invalid contact number." });
        }

        // 🔒 Check duplicates (parallel for performance)
        const [existingEmail, existingContact] = await Promise.all([
            User.findOne({ email: normalizedEmail }),
            User.findOne({ contact: normalizedContact })
        ]);

        if (existingEmail) {
            return res.status(400).json({ error: "Email already exists." });
        }

        if (existingContact) {
            return res.status(400).json({ error: "Contact already exists." });
        }

        // 🔒 Determine role (FIRST USER = SUPERADMIN)
        const isFirstUser = (await User.countDocuments()) === 0;
        const role = isFirstUser ? "superadmin" : "admin";

        // 🔐 Token generation
        const verifyToken = crypto.randomBytes(32).toString("hex");
        const hashedVerifyToken = crypto
            .createHash("sha256")
            .update(verifyToken)
            .digest("hex");

        const verifyTokenExpiry = Date.now() + 15 * 60 * 1000;

        // 🔐 Password hashing
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // ✅ Create user
        const user = await User.create({
            nicheId: niche ? nicheId : null,
            name: String(name).trim(),
            email: normalizedEmail,
            contact: normalizedContact,
            password: hashedPassword,
            role,
            verifyToken: hashedVerifyToken,
            verifyTokenExpiry,
        });

        // 🔔 Notify superadmins (only if NOT first user)
        if (!isFirstUser) {
            const superadmins = await User.find({ role: "superadmin" }).select("_id");

            if (superadmins.length) {
                await Promise.all(
                    superadmins.map((sa) =>
                        createNotification({
                            receiverId: sa._id,
                            senderId: user._id,
                            type: "admin_registered",
                            title: "New Admin Registered",
                            message: `${user.name} registered as a new admin`,
                            link: `/dashboard/admins/view/${user._id}`,
                            meta: { adminId: user._id }
                        })
                    )
                );
            }
        }

        // 📧 Send verification email
        await sendVerifyEmail({
            email: user.email,
            token: verifyToken,
        });

        return res.status(201).json({
            message: isFirstUser
                ? "Superadmin created successfully. Please verify your email."
                : "Registered successfully. Please verify your email.",
        });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required."
            });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).json({
                error: "Invalid email or password."
            });
        }

        if (user.provider === "google") {
            return res.status(400).json({
                error: "This account was created using Google. Please sign in with Google."
            });
        }

        /* ---------------- EMAIL VERIFICATION ---------------- */

        if (!user.isVerified) {

            const verifyToken = crypto.randomBytes(32).toString("hex");

            const hashedVerifyToken = crypto
                .createHash("sha256")
                .update(verifyToken)
                .digest("hex");

            user.verifyToken = hashedVerifyToken;
            user.verifyTokenExpiry = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

            await user.save();

            try {
                await sendVerifyEmail({
                    email: user.email,
                    token: verifyToken
                });

                console.log("Verification email sent:", user.email);
            } catch (emailError) {
                console.error("Email sending failed:", emailError);
            }

            return res.status(401).json({
                error: "Email not verified. Verification email sent."
            });
        }

        /* ---------------- ACCOUNT STATUS ---------------- */

        if (user.status === "suspended") {
            return res.status(403).json({
                error: "Your account has been suspended. Please contact support."
            });
        }

        /* ---------------- PASSWORD CHECK ---------------- */

        const isValidPassword = await bcryptjs.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(400).json({
                error: "Invalid email or password."
            });
        }

        /* ---------------- UPDATE LAST LOGIN ---------------- */

        user.lastLoginAt = new Date();
        await user.save();

        /* ---------------- JWT ---------------- */

        const token = jwt.sign(
            { id: user._id },
            process.env.SECRET_TOKEN,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        return res.status(200).json({
            message: "Logged in successfully.",
            user: {
                _id: user._id,
                name: user.name
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            error: "Internal server error."
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            verifyToken: hashedToken,
            verifyTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                error: "Invalid or expired verification link.",
            });
        }

        user.isVerified = true;
        user.verifyToken = undefined;
        user.verifyTokenExpiry = undefined;

        await user.save();

        return res.status(200).json({
            message: "Email verified successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "User not found." });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: "Email already verified." });
        }

        // 🔐 regenerate token
        const verifyToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto
            .createHash("sha256")
            .update(verifyToken)
            .digest("hex");

        user.verifyToken = hashedToken;
        user.verifyTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min

        await user.save();

        await sendVerifyEmail({
            email: user.email,
            token: verifyToken,
        });

        return res.status(200).json({
            message: "Verification email resent.",
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const checkVerification = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: "Email is required." });
        }

        const user = await User.findOne({ email }).select("isVerified");

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        return res.status(200).json({
            isVerified: user.isVerified === true,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        return res.status(200).json({ message: "Logged Out Successfully." });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;


        if (!email) {
            return res.status(400).json({ error: "Email is required." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "No account found with this email." });
        }
        if (!user.isVerified) {
            return res.status(403).json({ error: "Please verify your email before resetting password." });
        }

        await sendResetEmail({ email, userId: user._id });

        return res.status(200).json({
            message: "Reset password link has been sent to your email address.",
        });
    } catch (error) {
        return res.status(500).json({ error: "Server error: " + error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body;

        if (!token) {
            return res.status(400).json({ error: "Reset token is missing." });
        }

        if (!password || !confirmPassword) {
            return res.status(400).json({ error: "Both password and confirm password are required." });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Password and confirm password do not match." });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long." });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            forgotOrResetPasswordToken: hashedToken,
            forgotOrResetPasswordTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid or expired token." });
        }

        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(password, salt);

        user.forgotOrResetPasswordToken = undefined;
        user.forgotOrResetPasswordTokenExpiry = undefined;

        await user.save();

        return res.status(200).json({ message: "Password reset successfully." });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        const userId = await getDataFromToken(req);

        const user = await User.findById(userId).select("+password");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (user.status === "suspended") {
            return res.status(403).json({ error: "Account suspended." });
        }

        /* ===============================
           VALIDATIONS
        =============================== */
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters long.",
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                error: "Passwords do not match.",
            });
        }

        /* ===============================
           CASE 1: GOOGLE USER (NO PASSWORD)
        =============================== */
        if (user.provider === "google" && !user.password) {
            const salt = await bcryptjs.genSalt(10);
            user.password = await bcryptjs.hash(newPassword, salt);

            user.provider = "hybrid"; // upgrade

            await user.save();

            return res.status(200).json({
                message: "Password set successfully. You can now login with email/password.",
            });
        }

        /* ===============================
           CASE 2: LOCAL / HYBRID USER
        =============================== */
        if (!currentPassword) {
            return res.status(400).json({
                error: "Current password is required.",
            });
        }

        const isMatch = await bcryptjs.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({
                error: "Current password is incorrect.",
            });
        }

        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(newPassword, salt);

        user.provider = user.googleId ? "hybrid" : "local";

        await user.save();

        return res.status(200).json({
            message: "Password changed successfully.",
        });

    } catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

export const myProfile = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const user = await User.findById(userId)
            .select("_id name email role ref_code profile_image nicheId contact bio provider")
            .lean();

        if (!user) return res.status(404).json({ error: "User not found" });

        return res.status(200).json({ data: user });

    } catch (error) {
        // avoid leaking internal errors
        return res.status(500).json({ error: "Internal server error" });
    }
};

const deleteFileIfExists = async (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try {
            await fs.promises.unlink(filePath);
            console.log(`Deleted old file: ${filePath}`);
        } catch (err) {
            console.warn(`Failed to delete old image ${filePath}: ${err.message}`);
        }
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const { name, bio, status, contact } = req.body;

        const sanitizedContact = normalizeIndianPhone(contact);

        /* =============================
           IMAGE UPLOAD
        ============================= */

        let profileImagePath = user.profile_image;
        let profileImageCompressedPath = user.profile_image_compressed;

        if (req.files && req.files.profile_image) {
            const objectId = user._id;
            const profilePath = `../genie-media/profile/${objectId}/`;

            ensureDirectoryExistence(profilePath);

            // delete old
            await deleteFileIfExists(user.profile_image);
            await deleteFileIfExists(user.profile_image_compressed);

            const uploadedFile = req.files.profile_image[0];

            const ext = path.extname(uploadedFile.originalname).toLowerCase();
            const baseName = path.basename(uploadedFile.filename, ext);

            const originalTarget = `${profilePath}${baseName}${ext}`;
            const webpTarget = `${profilePath}${baseName}-compressed.webp`;

            // move original
            await fs.promises.rename(uploadedFile.path, originalTarget);

            // compress
            await sharp(originalTarget).toFormat("webp").toFile(webpTarget);

            profileImagePath = originalTarget;
            profileImageCompressedPath = webpTarget;
        }

        /* =============================
           UPDATE
        ============================= */

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    name,
                    bio,
                    status,
                    contact: sanitizedContact, // ✅ controlled
                    profile_image: profileImagePath?.replace("../media", ""),
                    profile_image_compressed: profileImageCompressedPath?.replace("../media", ""),
                },
            },
            { new: true }
        );

        return res.status(200).json({
            message: "Profile updated successfully.",
            updatedUser,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};