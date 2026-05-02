import RegularUser from "../models/regularUser.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

// const transport = nodemailer.createTransport({
//     host: "sandbox.smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//         user: process.env.MAILTRAP_USER,
//         pass: process.env.MAILTRAP_PASS,
//     },
// });

const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
    },
});

export const sendVerifyEmail = async ({ email, token }) => {
    const verifyLink = `${process.env.DASHBOARD_URL}/verify-email/success?token=${token}`;

    const mailOptions = {
        from: process.env.MAIL_FROM || "no-reply@example.com",
        to: email,
        subject: "Verify your email address",
        html: `
      <div style="font-family: Arial, sans-serif; padding: 30px;">
        <h2>Email Verification</h2>
        <p>Please verify your email by clicking the button below:</p>
        <a href="${verifyLink}"
           style="display:inline-block;padding:12px 24px;
           background:#28a745;color:#fff;text-decoration:none;
           border-radius:6px;">
           Verify Email
        </a>
        <p style="margin-top:20px;font-size:13px;color:#666;">
          This link will expire in 15 minutes.
        </p>
      </div>
    `,
    };

    await transport.sendMail(mailOptions);
};

export const sendResetEmail = async ({ email, userId }) => {
    try {
        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        await RegularUser.findByIdAndUpdate(userId, {
            $set: {
                forgotOrResetPasswordToken: hashedToken,
                forgotOrResetPasswordTokenExpiry: Date.now() + 60 * 60 * 1000, // 1 hour
            },
        });

        const resetLink = `${process.env.DASHBOARD_URL}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.MAIL_FROM || "no-reply@example.com",
            to: email,
            subject: "Password Reset Request - Action Required",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Password Reset Request</h1>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                    <p style="font-size: 16px; margin-bottom: 20px; color: #555;">
                        Hello,
                    </p>
                    
                    <p style="font-size: 16px; margin-bottom: 25px; color: #555;">
                        We received a request to reset the password for your account. To proceed with resetting your password, please click the button below within the next <strong>24 hours</strong>.
                    </p>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${resetLink}" 
                        style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                        Reset My Password
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #777; margin-bottom: 20px;">
                        If the button above doesn't work, you can also copy and paste the following link into your browser:
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea; margin-bottom: 25px;">
                        <p style="font-size: 13px; color: #666; margin: 0; word-break: break-all; font-family: 'Courier New', monospace;">
                        ${resetLink}
                        </p>
                    </div>
                    
                    <!-- Security Notice -->
                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px; margin: 25px 0;">
                        <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">🔒 Security Notice</h3>
                        <p style="color: #856404; margin: 0; font-size: 14px;">
                        If you did not request this password reset, please ignore this email and ensure your account is secure. Your password will remain unchanged.
                        </p>
                    </div>
                    
                    <p style="font-size: 14px; color: #777; margin-bottom: 10px;">
                        For your security, this link will expire in 24 hours.
                    </p>
                    
                    <p style="font-size: 14px; color: #777;">
                        If you continue to have problems, please contact our support team.
                    </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="font-size: 12px; color: #6c757d; margin: 0 0 10px 0;">
                        This email was sent to ${email}
                    </p>
                    <p style="font-size: 12px; color: #6c757d; margin: 0;">
                        © ${new Date().getFullYear()} Your Company Name. All rights reserved.
                    </p>
                    </div>
                    
                </div>
                
                <!-- Footer disclaimer -->
                <div style="text-align: center; margin-top: 20px;">
                    <p style="font-size: 11px; color: #adb5bd;">
                    This is an automated message, please do not reply to this email.
                    </p>
                </div>
                </div>
            `,
        };

        return await transport.sendMail(mailOptions);
    } catch (error) {
        throw new Error("Error sending reset email: " + error.message);
    }
};

export const sendAccessEmail = async ({ email, password, role }) => {
    try {
        const mailOptions = {
            from: process.env.MAIL_FROM || "no-reply@example.com",
            to: email,
            subject: 'Welcome to Campusaim 🎉',
            html: `
            <div style="font-family: sans-serif; line-height: 1.5;">
            <h2>Welcome, ${email.split("@")[0]} 👋</h2>
            <p>You have been added as a <strong>${role}</strong> on the Campusaim portal.</p>
            <p><strong>Login Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${password}</p>
            <p>👉 Please login and change your password immediately.</p>
            <br />
            <a href="https://console.admissionjockey.in" target="_blank" style="padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Login Now</a>
            <br/><br/>
            <p>Thanks, <br/> Team Campusaim</p>
            </div>
        `
        };

        // Step 3: Send the email
        const info = await transport.sendMail(mailOptions);
    } catch (error) {
        console.error('Failed to send welcome email:', error.message);
    }
};