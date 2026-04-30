import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import mongoose from "mongoose";
import http from "http";

import { initSocket } from "./socket.js";
import { db, connectDB, connectGenieDB } from "./mongoose/index.js";

// Routers
import authRouter from "./routes/authRouter.js";
import locationRouter from "./routes/locationRouter.js";
import documentsRouter from "./routes/documentsRouter.js";
import bankDetailsRouter from "./routes/bankDetailsRouter.js";
import userRouter from "./routes/userRouter.js";
import leadsRouter from "./routes/leadsRouter.js";
import notificationRouter from "./routes/notificationRouter.js";
import questionSetRouter from "./routes/questionRouter.js";
import analyticsRouter from "./routes/analyticsRouter.js";
import assingmentRouter from "./routes/assingmentRouter.js";
import nicheRouter from "./routes/nicheRouter.js";
import systemHealthRouter from "./routes/systemHealthRouter.js";
import { apiMonitor } from "./controller/systemHealthController.js";
import goalRouter from "./routes/goalRouter.js";
import supportRouter from "./routes/supportRoutes.js";
import incentiveRouter from "./routes/incentiveRouter.js";
import withdrawRouter from "./routes/withdrawRouter.js";
import comissionRouter from "./routes/comissionRoutes.js";

dotenv.config();

// INIT APP FIRST (IMPORTANT)
const app = express();
const PORT = process.env.PORT;

// ✅ CREATE SERVER (for socket)
const server = http.createServer(app);
initSocket(server);

// File helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= MIDDLEWARE =================
app.use(helmet());
app.use(apiMonitor);
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use(express.static(path.join(__dirname, "../public")));
app.use("/media", express.static(path.join(__dirname, "../media")));

// ================= CORS =================
const allowedOrigins = [
  process.env.APP_DASHBOARD_URL,
  process.env.CAMPUSAIM_API_URL,
  process.env.CAMPUSAIM_FRONT_URL,
  process.env.CAMPUSAIM_MANAGE_URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ================= GUARD =================
export function originGuard(req, res, next) {
  const origin = req.headers.origin;
  if (!origin || !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "Access Denied" });
  }
  next();
}

// Routes
app.get("/", (req, res) => res.json("API is running!"));

app.get("/health", (req, res) => {
    res.json({
        mainDB: mongoose.connection.readyState === 1 ? "UP" : "DOWN",
        genieDB: db.readyState === 1 ? "UP" : "DOWN",
        uptime: process.uptime(),
    });
});

app.use("/api/", originGuard, authRouter);
app.use("/api/", originGuard, locationRouter);
app.use("/api/", originGuard, documentsRouter);
app.use("/api/", originGuard, bankDetailsRouter);
app.use("/api/", originGuard, userRouter);
app.use("/api/", originGuard, leadsRouter);
app.use("/api/", originGuard, notificationRouter);
app.use("/api/", originGuard, questionSetRouter);
app.use("/api/", originGuard, analyticsRouter);
app.use("/api/", originGuard, assingmentRouter);
app.use("/api/", originGuard, nicheRouter);
app.use("/api/", originGuard, systemHealthRouter);
app.use("/api/", originGuard, goalRouter);
app.use("/api/", originGuard, supportRouter);
app.use("/api/", originGuard, incentiveRouter);
app.use("/api/", originGuard, withdrawRouter);
app.use("/api/", originGuard, comissionRouter);

// ================= START SERVER =================
const startServer = async () => {
  try {
    // ✅ WAIT for BOTH DBs
    await connectDB();
    await connectGenieDB();

    console.log("All databases connected successfully");

    // ✅ START ONLY ONE SERVER
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`API + WS running on http://0.0.0.0:${PORT}`);
    });

  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
};

startServer();