// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// const connections = {
//   regularDatabase: mongoose.createConnection(process.env.MONGODB_URL),
//   profileDatabase: mongoose.createConnection(process.env.MONGODB_PROFILE_URL),
//   analyticDatabase: mongoose.createConnection(process.env.MONGODB_ANALYTIC_URL),
//   askDatabase: mongoose.createConnection(process.env.MONGODB_ASK_URL),
//   leadsDatabase: mongoose.createConnection(process.env.MONGODB_LEADS_URL),
// };

// // Listen for connection errors
// for (const [name, conn] of Object.entries(connections)) {
//   conn.on("connected", () => { });

//   conn.on("error", (err) => {
//     console.error(`${name} failed to connect:`, err.message);
//   });

//   conn.on("disconnected", () => {
//     console.warn(`${name} disconnected`);
//   });
// }

// export const {
//   regularDatabase,
//   profileDatabase,
//   analyticDatabase,
//   askDatabase,
//   leadsDatabase,
// } = connections;

// database/Databases.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const createConnection = (uri, name) => {
  const conn = mongoose.createConnection(uri);

  conn.on("connected", () => {
    console.log(`✅ ${name} connected`);
  });

  conn.on("error", (err) => {
    console.error(`❌ ${name} error:`, err.message);
  });

  return conn;
};

export const regularDatabase = createConnection(process.env.MONGODB_URL, "regularDB");
export const profileDatabase = createConnection(process.env.MONGODB_PROFILE_URL, "profileDB");
export const analyticDatabase = createConnection(process.env.MONGODB_ANALYTIC_URL, "analyticDB");
export const askDatabase = createConnection(process.env.MONGODB_ASK_URL, "askDB");
export const leadsDatabase = createConnection(process.env.MONGODB_LEADS_URL, "leadsDB");