import express from "express";
import { changePassword, checkVerification, forgotPassword, googleAuth, login, logout, myProfile, register, resendVerificationEmail, resetPassword, updateProfile, verifyEmail } from "../controller/authController.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { authMiddleware } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

const ensureDirectoryExistence = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const tempStoragePath = "../media/temp/";
ensureDirectoryExistence(tempStoragePath)

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempStoragePath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage })

// Auth Routes
authRouter.post("/auth/google", googleAuth);
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/verify-email", verifyEmail);
authRouter.post("/resend-verification-email", resendVerificationEmail);
authRouter.get("/check-verification", checkVerification);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/change-password", changePassword);
authRouter.get("/profile", authMiddleware, myProfile);
authRouter.put("/update-profile", upload.fields([{ name: "profile_image", maxCount: 1 }]), updateProfile);

export default authRouter;