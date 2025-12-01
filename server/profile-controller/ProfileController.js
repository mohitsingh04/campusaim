import {
  SendProfileDeletionMail,
  sendProfileEmailVerification,
  sendProfileResetEmail,
} from "../email/profileEmail.js";
import RegularUser from "../profile-model/RegularUser.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ProfileLocation from "../profile-model/ProfileLocation.js";
import ProfileBio from "../profile-model/ProfileBio.js";
import ProfileDoc from "../profile-model/ProfileDoc.js";
import ProfileEducation from "../profile-model/ProfileEducation.js";
import ProfileExperience from "../profile-model/ProfileExperience.js";
import ProfileLanguage from "../profile-model/ProfileLanguage.js";
import ProfileSkills from "../profile-model/ProfileSkills.js";
import { addProfileScore } from "./ProfileScoreController.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import ProfileScore from "../profile-model/ProfileScore.js";
import { removeToken } from "../utils/getDataFromToken.js";
import { ProfilePermissions } from "../profile-model/ProfilePermissions.js";
import { generateUniqueId } from "../utils/Callback.js";
import { ProfileRoles } from "../profile-model/ProfileRoles.js";

dotenv.config();
const saltRounds = 10;

export const profileRegister = async (req, res) => {
  try {
    let { username, name, email, mobile_no, password, confirm_password, role } =
      req.body;

    if (
      !username ||
      !name ||
      !email ||
      !mobile_no ||
      !password ||
      !confirm_password
    ) {
      return res.status(400).json({ error: "Required Field is Missing." });
    }

    username = username.toLowerCase().trim();

    let score = 0;
    if (username) score += 2;
    if (name) score += 2;
    if (email) score += 2;
    if (mobile_no) score += 2;

    if (password !== confirm_password) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const normalizedMobile = mobile_no.startsWith("+")
      ? mobile_no
      : `+${mobile_no}`;

    const isExistingUsername = await RegularUser.findOne({
      username: username,
    });

    if (isExistingUsername) {
      return res.status(400).json({ error: "Already Existing Username" });
    }

    // Check existing email
    const isExistingEmail = await RegularUser.findOne({ email });
    if (isExistingEmail) {
      return res.status(400).json({ error: "Already Existing Email" });
    }

    // Check existing mobile
    const isExistingMobile = await RegularUser.findOne({
      mobile_no: normalizedMobile,
    });
    if (isExistingMobile) {
      return res.status(400).json({ error: "Already Existing Mobile Number" });
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const uniqueId = await generateUniqueId(RegularUser);

    // Role resolve
    let roleDoc = null;
    if (role) {
      roleDoc = await ProfileRoles.findOne({ role });
      if (!roleDoc) {
        return res.status(400).json({ error: "Invalid Role Provided" });
      }
    } else {
      roleDoc = await ProfileRoles.findOne({ role: "User" });
      if (!roleDoc) {
        return res.status(400).json({ error: "Invalid Role Provided" });
      }
    }

    let permissions = [];
    if (role === "Property Manager") {
      const PropertyPermissions = await ProfilePermissions.findOne({
        title: "Property",
      });

      if (PropertyPermissions) {
        permissions = PropertyPermissions.permissions.map((item) => item._id);
      }
    }

    // Create new user
    const newUser = new RegularUser({
      uniqueId,
      username, // already lowercase
      name,
      email,
      mobile_no: normalizedMobile,
      password: passwordHash,
      role: roleDoc?._id || null,
      permissions,
    });

    await newUser.save();

    await addProfileScore({ userId: uniqueId, score });
    await sendProfileEmailVerification({ uniqueId, email, req });

    return res.status(201).json({ message: "User Registered Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getProfileEmailVerification = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: "Token is required." });
    }

    const user = await RegularUser.findOne({ verifyToken: token });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    const verifiedUser = await RegularUser.findOneAndUpdate(
      { uniqueId: user.uniqueId },
      {
        $set: { verified: true },
        $unset: { verifyToken: "", verifyTokenExpiry: "" },
      },
      { new: true }
    );

    if (!verifiedUser) {
      return res.status(500).json({ error: "Failed to verify email." });
    }

    return res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const verifyProfileEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await RegularUser.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found. Please check your email." });
    }

    if (user.verified) {
      return res.status(400).json({ error: "You are already Verified." });
    }

    await sendProfileEmailVerification({ uniqueId: user.uniqueId, email });

    return res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const profileLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await RegularUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User does not exist!" });
    }

    if (user.status === "Suspended") {
      return res
        .status(400)
        .json({ error: "Sorry Your Are Blocked. Please Support." });
    }

    if (!user?.isGoogleLogin) {
      const isMatch = await bcrypt.compare(password, user?.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Incorrect password!" });
      }
    }

    if (user?.isGoogleLogin) {
      return res
        .status(401)
        .json({ error: "Your Account is Signed Up with Google" });
    }

    if (!user?.verified) {
      await sendProfileEmailVerification({
        uniqueId: user.uniqueId,
        email,
        req,
      });
      return res.status(403).json({
        error: "Email not verified. Verification email sent.",
        flag: "UnVerified",
      });
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET_VALUE
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 24 * 60 * 60 * 1000 * 365,
    });

    return res.status(200).json({ message: "Logged in successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const profileDetails = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({ error: "Access Denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_VALUE);

    const userDoc = await RegularUser.findById(decoded.id);

    if (!userDoc) {
      await removeToken(res);

      return res.status(404).json({ error: "User not found" });
    }
    if (userDoc.status === "Suspended" || !userDoc?.verified) {
      await removeToken(res);

      return res.status(404).json({ error: "Sorry You Are Blocked" });
    }

    const user = userDoc.toObject();

    const location = await ProfileLocation.findOne({
      userId: user?.uniqueId,
    }).lean();

    const finalData = {
      ...user,
      ...(location && {
        address: location.address,
        pincode: location.pincode,
        city: location.city,
        state: location.state,
        country: location.country,
      }),
    };

    return res.status(200).json(finalData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const profileLogout = async (req, res) => {
  try {
    await removeToken(res);

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getProfileToken = async (req, res) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Please log in." });
    }

    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const profileForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await RegularUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await sendProfileResetEmail(user, req);

    return res.status(200).json({ message: "Password reset email sent." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getProfileResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: "Token is required." });
    }

    const user = await RegularUser.findOne({ resetToken: token });

    if (!user) {
      return res.status(404).json({ error: "Invalid or expired token." });
    }

    return res.status(200).json({ message: "Valid token", token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const profilePostResetToken = async (req, res) => {
  try {
    const { new_password, confirm_password, token } = req.body;

    const tokenCheck = await RegularUser.findOne({ resetToken: token });

    if (!tokenCheck) {
      return res.status(404).json({ error: "Invalid Token." });
    }

    if (tokenCheck.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ error: "expired token" });
    }

    if (!new_password || !confirm_password || !token) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const passwordHash = await bcrypt.hash(new_password, 10);

    const user = await RegularUser.findOneAndUpdate(
      { resetToken: token },
      {
        $set: { password: passwordHash },
        $unset: { resetToken: "", resetTokenExpiry: "" },
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const changeProfilePassword = async (req, res) => {
  try {
    const { id, current_password, new_password, confirm_password } = req.body;

    if (!id || !current_password || !new_password || !confirm_password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await RegularUser.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (new_password !== confirm_password) {
      return res
        .status(400)
        .json({ error: "New password and confirm password must match" });
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const passwordHash = await bcrypt.hash(new_password, saltRounds);

    user.password = passwordHash;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const ProfileAccountDeletionOtp = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    if (!uniqueId) {
      return res.status(400).json({ error: "UniqueId is Required" });
    }

    const token = await jwt.sign({ uniqueId }, process.env.JWT_SECRET_VALUE);
    const updateDeletion = await RegularUser.findOneAndUpdate(
      { uniqueId },
      {
        $set: {
          deletionToken: token,
          deletionTokenExpiry: new Date(Date.now() + 3 * 60 * 1000),
        },
      },
      { new: true }
    );
    if (!updateDeletion) {
      return res.status(404).json({ error: "User Not Found" });
    }

    await SendProfileDeletionMail(updateDeletion, token, req);

    return res.status(200).json({ message: "Mail Sent Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DeleteAccountConfirm = async (req, res) => {
  try {
    const { uniqueId, token } = req.params;
    if (!uniqueId || !token) {
      return res.status(400).json({ error: "Required Field is Missing" });
    }

    const decodedToken = jwt.decode(token, process.env.JWT_SECRET_VALUE);
    if (decodedToken.uniqueId !== uniqueId) {
      return res.status(400).json({ error: "Invalid User" });
    }

    const isExisting = await RegularUser.findOne({ uniqueId });
    if (!isExisting) {
      return res.status(400).json({ error: "User Not Found" });
    }

    if (isExisting.deletionTokenExpiry < Date.now()) {
      return res.status(400).json({ error: "Link Has Been Expired" });
    }

    const propertyFolder = path.join(
      __dirname,
      `../../media/profile/${uniqueId}`
    );

    await ProfileBio.deleteMany({ userId: uniqueId });
    await ProfileDoc.deleteMany({ userId: uniqueId });
    await ProfileEducation.deleteMany({ userId: uniqueId });
    await ProfileExperience.deleteMany({ userId: uniqueId });
    await ProfileLanguage.deleteMany({ userId: uniqueId });
    await ProfileSkills.deleteMany({ userId: uniqueId });
    await ProfileScore.deleteMany({ userId: uniqueId });

    const folderExists = await fs
      .stat(propertyFolder)
      .then(() => true)
      .catch(() => false);

    if (folderExists) {
      await fs.rm(propertyFolder, { recursive: true, force: true });
    }
    await ProfileLocation.deleteMany({ userId: uniqueId });
    await RegularUser.findOneAndDelete({ uniqueId });

    await removeToken(res);

    return res.status(200).json({ message: "Account Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
