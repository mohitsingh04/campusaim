import { Server } from "socket.io";
import { getCpuUsage } from "./utils/getCpuUsage.js";
import { setIO } from "./helper/socket/socketInstance.js";

export const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [
                process.env.FRONTEND_URL,
                process.env.DASHBOARD_URL,
                "http://localhost:3000"
            ],
            credentials: true
        }
    });

    // 🔥 store globally
    setIO(io);

    // ===== EXISTING HEALTH SYSTEM (KEEP THIS) =====
    setInterval(async () => {
        try {
            const memory = process.memoryUsage();
            const cpuUsage = await getCpuUsage(100);

            io.emit("metrics:health", {
                timestamp: Date.now(),
                cpu: Number(cpuUsage),
                memoryMB: Number((memory.rss / 1024 / 1024).toFixed(2))
            });

        } catch (err) {
            console.error("WS broadcast error:", err);
        }
    }, 2000);

    // ===== CONNECTION HANDLER =====
    io.on("connection", (socket) => {
        console.log("WS Connected:", socket.id);

        const userId = socket.handshake.auth?.userId;
        const orgId = socket.handshake.auth?.organizationId;

        if (userId) socket.join(userId);         // personal room
        if (orgId) socket.join(orgId);           // org room

        socket.on("disconnect", () => {
            console.log("WS Disconnected:", socket.id);
        });
    });

    return io;
};