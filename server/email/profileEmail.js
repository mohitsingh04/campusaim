import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import RegularUser from "../profile-model/RegularUser.js";
import ejs from "ejs";
import path from "path";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: Number(process.env.EMAIL_PORT) === 465 ? true : false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendProfileEmailVerification = async ({
  uniqueId,
  email,
  req,
}) => {
  try {
    const token = jwt.sign({ uniqueId }, process.env.JWT_SECRET_VALUE, {
      expiresIn: "1h",
    });

    const saveVerifyToken = await RegularUser.findOneAndUpdate(
      { uniqueId },
      {
        $set: {
          verifyToken: token,
          verifyTokenExpiry: new Date(Date.now() + 6000),
        },
      },
      { new: true }
    );

    if (!saveVerifyToken) {
      return { message: "User not found." };
    }

    const verificationUrl = `${req.headers.origin}/auth/verify-email/confirm/${token}`;

    const templatePath = path.resolve("template", "EmailVerification.ejs");

    const html = await ejs.renderFile(templatePath, {
      verificationUrl,
      user: saveVerifyToken,
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Account",
      html,
    };

    await transporter.sendMail(mailOptions);

    return { message: "Verification email sent. Check your inbox." };
  } catch (err) {
    console.error("Error in sendEmailVerification:", err);
  }
};

export const sendProfileResetEmail = async (user, req) => {
  try {
    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET_VALUE,
      { expiresIn: "1h" }
    );

    const userInfo = await RegularUser.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          resetToken: token,
          resetTokenExpiry: new Date(Date.now() + 3600000),
        },
      },
      { new: true }
    );

    const resetUrl = `${req.headers.origin}/auth/reset-password/confirm/${token}`;

    const templatePath = path.resolve("template", "ResetPassword.ejs");

    const html = await ejs.renderFile(templatePath, {
      resetUrl,
      user: userInfo,
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      html: html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Error sending password reset email:", error);
  }
};

export const sendSwitchingEmail = async (user) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/profile/switch/professional/confirm/${user?.professionalToken}`;

    const templatePath = path.resolve("template", "SwitchProfile.ejs");

    const html = await ejs.renderFile(templatePath, { resetUrl, user });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Switch To Professional",
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending switching email:", error);
  }
};
export const SendProfileDeletionMail = async (user, token, req) => {
  try {
    const deletionUrl = `${req.headers.origin}/profile/delete-account/confirm/${token}`;

    const templatePath = path.resolve("template", "DeleteAccountMail.ejs");

    const html = await ejs.renderFile(templatePath, { deletionUrl, user });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Delete Account Request",
      html: html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Error sending profile deletion email:", error);
  }
};
