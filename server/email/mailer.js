import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

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
            <a href="https://app.campusaim.com" target="_blank" style="padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Login Now</a>
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