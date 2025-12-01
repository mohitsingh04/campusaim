import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import RegularUser from "../profile-model/RegularUser.js";
import axios from "axios";
import { generateUniqueId } from "../utils/Callback.js";
import { addProfileScore } from "./ProfileScoreController.js";
import { ProfileRoles } from "../profile-model/ProfileRoles.js";
import { ProfilePermissions } from "../profile-model/ProfilePermissions.js";

const client = new OAuth2Client(process.env.GOOGLE_ID);

// Helper: Get 2 initials from name
const getInitials = (fullName) => {
  const parts = fullName
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(" ")
    .filter(Boolean);

  let initials = parts.map((n) => n[0]).join("");
  return initials.slice(0, 2);
};

const generateRandomNumber = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

const generateUniqueUsername = async (name) => {
  let base, username, exists;

  do {
    base = getInitials(name) + generateRandomNumber();
    username = base.toLowerCase();
    exists = await RegularUser.findOne({ username });
  } while (exists);

  return username;
};

export const ProfileGoogleLoginAuth = async (req, res) => {
  const { token } = req.body;

  try {
    let payload;

    if (token.split(".").length === 3) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_ID,
      });
      payload = ticket.getPayload();
    } else {
      const { data } = await axios.get(
        `https://www.googleapis.com/oauth2/v3/userinfo`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      payload = data;
    }

    const { name, email, picture } = payload;

    let existingUser = await RegularUser.findOne({ email });

    if (existingUser) {
      if (existingUser.isGoogleLogin) {
        if (!existingUser.verified) {
          return res.status(403).json({
            error: "Your account is not verified. Please contact support.",
          });
        }

        if (existingUser.status === "Suspended") {
          return res.status(403).json({
            error: "Your account has been suspended. Please contact support.",
          });
        }

        const accessToken = jwt.sign(
          { id: existingUser._id, email: existingUser.email },
          process.env.JWT_SECRET_VALUE
        );

        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
          message: "Login success",
          user: existingUser,
          isGoogleLogin: true,
        });
      } else {
        return res.status(400).json({
          error: "This email is already registered with Login with Email.",
        });
      }
    }

    const newUniqueId = await generateUniqueId(RegularUser);
    const username = await generateUniqueUsername(name);

    let roleDoc = await ProfileRoles.findOne({ role: "User" });
    if (!roleDoc) {
      return res.status(400).json({ error: "Role 'User' not found" });
    }

    let permissions = [];

    if (roleDoc.role === "Property Manager") {
      const propPerm = await ProfilePermissions.findOne({ title: "Property" });
      if (propPerm) {
        permissions = propPerm.permissions.map((p) => p._id);
      }
    }

    const newUser = new RegularUser({
      name,
      email,
      profile: [picture],
      isGoogleLogin: true,
      verified: true,
      status: "Active",
      uniqueId: newUniqueId,
      username,
      role: roleDoc._id,
      permissions,
    });

    const savedUser = await newUser.save();

    let score = 0;
    if (username) score += 2;
    if (name) score += 2;
    if (email) score += 2;
    if (savedUser.mobile_no) score += 2;

    await addProfileScore({ userId: newUniqueId, score });

    const accessToken = jwt.sign(
      { id: savedUser._id, email: savedUser.email },
      process.env.JWT_SECRET_VALUE
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User created and login success",
      user: savedUser,
      isGoogleLogin: true,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};
