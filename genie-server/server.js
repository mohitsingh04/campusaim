import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import http from "http";
import { initSocket } from "./socket.js";

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
const app = express();
const PORT = process.env.PORT;

const server = http.createServer(app);

initSocket(server);

// File helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(apiMonitor);
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Static folders
app.use(express.static(path.join(__dirname, "../public")));
app.use("/genie-media", express.static(path.join(__dirname, "../genie-media")));

// Allowed origins
const allowedOrigins = [
  process.env.DASHBOARD_URL,
  process.env.DASHBOARD_BUILD_URL,
  process.env.FRONTEND_URL,
  "http://192.168.29.22:1002",
  "http://10.170.120.123:1002",
  "http://127.0.0.1:5500",
  "http://10.60.55.47:1002",
  "http://localhost:2001"
];

// API CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Optional guard for extra security
export function originGuard(req, res, next) {
  const origin = req.headers.origin;
  if (!origin || !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "Access Denied" });
  }
  next();
}

// Routes
app.get("/", (req, res) => res.json("API is running!"));
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

server.listen(PORT, "0.0.0.0", () => {
  console.log(`API + WS running on http://0.0.0.0:${PORT}`);
});