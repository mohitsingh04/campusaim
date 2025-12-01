import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connections = {
  regularDatabase: mongoose.createConnection(process.env.MONGODB_URL),
  profileDatabase: mongoose.createConnection(process.env.MONGODB_PROFILE_URL),
  analyticDatabase: mongoose.createConnection(process.env.MONGODB_ANALYTIC_URL),
  askDatabase: mongoose.createConnection(process.env.MONGODB_ASK_URL),
};

// Listen for connection errors
for (const [name, conn] of Object.entries(connections)) {
  conn.on("connected", () => {});

  conn.on("error", (err) => {
    console.error(`${name} failed to connect:`, err.message);
  });

  conn.on("disconnected", () => {
    console.warn(`${name} disconnected`);
  });
}

export const {
  regularDatabase,
  profileDatabase,
  analyticDatabase,
  askDatabase,
} = connections;
