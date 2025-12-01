import Property from "../models/Property.js"; // <-- ADD THIS
import RegularUser from "../profile-model/RegularUser.js";
import { ProfilePermissions } from "../profile-model/ProfilePermissions.js";
import { ProfileRoles } from "../profile-model/ProfileRoles.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import PropertyVerification from "../models/PropertyVerification.js";
import ProfileConsent from "../profile-model/ProfileContsents.js";
import { getDataFromToken } from "../utils/getDataFromToken.js";
import ejs from "ejs";
import path from "path";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendPropertyVerifyEmailOTP = async (req, res) => {
  try {
    const { property_id, email } = req.body;

    if (!property_id || !email) {
      return res.status(400).json({
        message: "Property ID and Email are required",
        success: false,
      });
    }

    const property = await Property.findById(property_id);
    if (!property) {
      return res.status(404).json({ error: "Property Not Found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await PropertyVerification.findOneAndUpdate(
      { property_id },
      {
        property_id,
        email_verify_otp: otp,
        email_verify_otp_expiry: expiry,
        email_verified: false,
      },
      { new: true, upsert: true }
    );

    const templatePath = path.resolve(
      "template",
      "PropertyEmailVerification.ejs"
    );

    const html = await ejs.renderFile(templatePath, {
      otp,
      property_name: property?.property_name,
    });

    await transporter.sendMail({
      from: `"Property Verification" <${process.env.EMAIL}>`,
      to: email,
      subject: "Your Email Verification OTP",
      html,
    });

    res.status(200).json({
      message: "OTP sent successfully to email",
      success: true,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      error: "Failed to send OTP",
    });
  }
};
export const PropertyVerifyEmailOtpMatch = async (req, res) => {
  try {
    const { otp, property_id } = req.body;

    if (!otp || !property_id) {
      return res.status(400).json({
        error: "OTP and Property ID are required",
        success: false,
      });
    }

    const propertyVerifyDoc = await PropertyVerification.findOne({
      property_id,
    });

    if (!propertyVerifyDoc) {
      return res.status(404).json({
        error: "Property verification record not found",
        success: false,
      });
    }

    // Check if OTP matches
    if (propertyVerifyDoc.email_verify_otp !== Number(otp)) {
      return res.status(400).json({
        error: "Invalid OTP",
        success: false,
      });
    }

    // Check if OTP is expired
    if (propertyVerifyDoc.email_verify_otp_expiry < new Date()) {
      return res.status(400).json({
        error: "OTP has expired",
        success: false,
      });
    }

    // Mark email as verified
    propertyVerifyDoc.email_verified = true;
    propertyVerifyDoc.email_verify_otp = undefined;
    propertyVerifyDoc.email_verify_otp_expiry = undefined;

    await propertyVerifyDoc.save();

    res.status(200).json({
      message: "Email verified successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error matching OTP:", error);
    res.status(500).json({
      error: "Failed to match OTP",
    });
  }
};

export const PropertyConsentAndUserRoleUpdation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { property_consent, property_id } = req.body;
    const property_userId = await getDataFromToken(req);

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (typeof property_consent !== "boolean") {
      return res
        .status(400)
        .json({ error: "property_consent must be a boolean" });
    }

    let consentRecord = await ProfileConsent.findOne({ userId });

    if (consentRecord) {
      consentRecord.property_consent = property_consent;
      await consentRecord.save();
    } else {
      consentRecord = await ProfileConsent.create({
        userId,
        property_consent,
      });
    }

    // Fetch the role ID of "Property Manager"
    const propertyManagerRole = await ProfileRoles.findOne({
      role: "Property Manager",
    });

    if (!propertyManagerRole) {
      return res
        .status(500)
        .json({ error: "Property Manager role not found in database" });
    }

    const roleId = propertyManagerRole._id;

    const allPerms = await ProfilePermissions.find();

    const matchedPerms = allPerms.filter((perm) =>
      perm.roles.some((r) => r.equals(roleId))
    );

    const permissionIds = matchedPerms.flatMap((p) =>
      p.permissions.map((perm) => perm._id)
    );

    const updatedUser = await RegularUser.findByIdAndUpdate(
      userId,
      {
        role: roleId,
        permissions: permissionIds,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // ------------------------------------------------------
    // 4️⃣  FINAL STEP — Update Property.userId
    // ------------------------------------------------------

    if (!property_userId) {
      return res
        .status(400)
        .json({ error: "property_userId is required in body" });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      property_id,
      { userId: property_userId, claimed: true },
      { new: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ error: "Property not found" });
    }

    return res.status(200).json({
      message:
        "Consent, role, permissions, and property user updated successfully",
    });
  } catch (error) {
    console.error("Error saving consent and updating role:", error);
    res.status(500).json({
      error: "Failed to update consent, role, permissions, or property userId",
    });
  }
};
