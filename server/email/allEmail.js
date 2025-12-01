import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";
import RegularUser from "../profile-model/RegularUser.js";

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

export const policyMail = async ({ legalPolicy }) => {
  try {
    const allUsers = await RegularUser.find();
    if (!legalPolicy) throw new Error("Legal Policy is required.");

    const templatePath = path.resolve("template", "PolicyUpdate.ejs");

    console.log(`📢 Starting background email job for: ${legalPolicy}`);
    console.log(`👥 Total users to notify: ${allUsers.length}`);

    for (const user of allUsers) {
      const html = await ejs.renderFile(templatePath, { legalPolicy, user });

      const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: legalPolicy,
        html,
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (err) {
        console.warn(`⚠️ Failed to send mail:`, err.message);
      }

      await new Promise((r) => setTimeout(r, 1500)); // throttle
    }

    console.log("✅ All emails processed successfully.");
  } catch (error) {
    console.error("Email sending error:", error.message);
  }
};
