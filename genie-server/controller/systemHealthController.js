import os from "os";
import checkDiskSpace from "check-disk-space";
import { db } from "../mongoose/index.js";
import { getCpuUsage } from "../utils/getCpuUsage.js";

// --------- API METRICS STORE ---------
let totalRequests = 0;
let totalErrors = 0;
let totalTime = 0;

// --------- API MONITOR MIDDLEWARE ---------
export const apiMonitor = (req, res, next) => {
    if (req.path.includes("system-health")) return next();

    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;

        totalRequests++;
        totalTime += duration;

        if (res.statusCode >= 400) totalErrors++;
    });

    next();
};

// --------- SERVER HEALTH ---------
export const getServerHealth = async (req, res) => {
    try {
        const memory = process.memoryUsage();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();

        const uptimeSeconds = process.uptime();

        const uptime = {
            days: Math.floor(uptimeSeconds / 86400),
            hours: Math.floor((uptimeSeconds % 86400) / 3600),
            minutes: Math.floor((uptimeSeconds % 3600) / 60)
        };

        const cpuUsage = await getCpuUsage(100);

        return res.status(200).json({
            status: "healthy",
            uptime,
            cpu: {
                usage: `${cpuUsage}%`,
                cores: os.cpus().length,
                model: os.cpus()[0].model
            },
            memory: {
                processUsed: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
                free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
                total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`
            },
            platform: process.platform,
            nodeVersion: process.version
        });


    } catch (err) {
        return res.status(500).json({ error: "Server health check failed" });
    }
};

// --------- DATABASE HEALTH ---------
export const getDatabaseHealth = async (req, res) => {

    try {

        const state = db.readyState;

        const statusMap = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting"
        };

        // DB not ready yet
        if (state !== 1) {
            return res.json({
                status: statusMap[state],
                collections: 0,
                documents: 0,
                storageSize: "0 MB"
            });
        }

        const stats = await db.db?.stats();

        return res.json({
            status: "connected",
            collections: stats?.collections || 0,
            documents: stats?.objects || 0,
            storageSize: stats
                ? (stats.storageSize / 1024 / 1024).toFixed(2) + " MB"
                : "0 MB"
        });

    } catch (err) {
        console.error("DB health error:", err);
        res.status(500).json({ error: "Database health check failed" });
    }
};

// --------- API METRICS ---------
export const getApiHealth = async (req, res) => {
    try {

        const avgResponseTime =
            totalRequests === 0 ? 0 : (totalTime / totalRequests).toFixed(2);

        const errorRate =
            totalRequests === 0 ? 0 : ((totalErrors / totalRequests) * 100).toFixed(2);

        return res.status(200).json({
            totalRequests,
            totalErrors,
            avgResponseTime: avgResponseTime + " ms",
            errorRate: errorRate + "%"
        });

    } catch (err) {
        return res.status(500).json({ error: "API health check failed" });
    }
};

// --------- DISK HEALTH ---------
export const getDiskHealth = async (req, res) => {
    try {

        // detect OS
        const diskPath =
            process.platform === "win32"
                ? process.cwd().split("\\")[0] + "\\"
                : "/";

        const disk = await checkDiskSpace(diskPath);

        const free = disk.free;
        const size = disk.size;
        const used = size - free;

        return res.status(200).json({
            total: (size / 1024 / 1024 / 1024).toFixed(2) + " GB",
            free: (free / 1024 / 1024 / 1024).toFixed(2) + " GB",
            used: (used / 1024 / 1024 / 1024).toFixed(2) + " GB",
            usedPercent: ((used / size) * 100).toFixed(2) + "%"
        });

    } catch (err) {
        console.error("Disk health error:", err.message);

        return res.status(500).json({
            error: "Disk health check failed",
            message: err.message
        });
    }
};