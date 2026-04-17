import { io } from "socket.io-client";

let socket = null;
let listeners = [];

// 🔥 INIT SOCKET
export const initSocket = (user) => {
    if (!socket && user?._id) {
        socket = io(import.meta.env.VITE_API_URL, {
            withCredentials: true,
            auth: {
                userId: user._id,
            }
        });

        socket.on("connect", () => {
            console.log("✅ WS Connected:", socket.id);

            // 🔥 notify all waiting listeners ONCE
            listeners.forEach(cb => cb(socket));
            listeners = []; // ✅ CLEAR (IMPORTANT)
        });

        socket.on("disconnect", () => {
            console.log("❌ WS Disconnected");
        });

        socket.on("connect_error", (err) => {
            console.error("WS Error:", err.message);
        });
    }
};

// 🔥 WAIT FOR SOCKET READY
export const onSocketReady = (cb) => {
    if (socket) {
        cb(socket);
    } else {
        listeners.push(cb);
    }
};

// 🔥 SAFE GETTER
export const getSocket = () => socket;

// 🔥 CLEANUP (IMPORTANT)
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        listeners = [];
    }
};