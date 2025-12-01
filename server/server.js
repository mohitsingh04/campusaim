import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/index.js";
import cookieParser from "cookie-parser";
import analyticRouter from "./routes/AnalyticRoute.js";
import profileRoutes from "./routes/ProfileRoute.js";
import AiRoutes from "./routes/AiRoutes.js";
import askRouter from "./routes/AskRoute.js";
import path from "node:path";
import helmet from "helmet";
import fs from "node:fs"

dotenv.config();

const app = express();

app.use(express.static(path.resolve("../media")));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_DASHBOARD_URL,
  process.env.FRONTEND_CAREER_URL,
  process.env.FRONTEND_ASK_URL,
];

app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

export function originGuard(req, res, next) {
  const origin = req.headers.origin;
  if (!origin || !allowedOrigins.includes(origin)) {
    return res.redirect(process.env.FRONTEND_URL);
  }
  next();
}

app.get("/", (req, res) => {
  return res.redirect(process.env.FRONTEND_URL);
});
function getFolderSize(directoryPath) {
  let totalSize = 0;

  function calculateSize(folderPath) {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        calculateSize(filePath);
      }
    }
  }

  calculateSize(directoryPath);
  return totalSize;
}

// Create the route
app.get("/api/folder-size", (req, res) => {
  try {
    const folderPath = path.resolve("../media"); // Adjust if needed

    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: "Media folder not found" });
    }

    const totalBytes = getFolderSize(folderPath);

    const sizeKB = (totalBytes / 1024).toFixed(2);
    const sizeMB = (totalBytes / (1024 * 1024)).toFixed(2);
    const sizeGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);

    return res.json({
      folder: folderPath,
      size: {
        bytes: totalBytes,
        kilobytes: `${sizeKB} KB`,
        megabytes: `${sizeMB} MB`,
        gigabytes: `${sizeGB} GB`,
      },
    });
  } catch (error) {
    console.error("Error calculating folder size:", error);
    return res.status(500).json({ error: "Error calculating folder size" });
  }
});

app.get("/api", (req, res) => {
  return res.redirect(process.env.FRONTEND_URL);
});
app.use("/api/", originGuard, router);
app.use("/api/", originGuard, analyticRouter);
app.use("/api/", originGuard, profileRoutes);
app.use("/api/", originGuard, AiRoutes);
app.use("/api/", originGuard, askRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on PORT ${process.env.PORT}`);
});
