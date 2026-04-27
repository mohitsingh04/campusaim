import mongoose from "mongoose";
import Role from "../models/role.js";

/* ================= ROLE MAPPING ================= */

const ROLE_MAP = {
    "super admin": "superadmin",
    "property manager": "admin",
    "admin": "admin",
    "partner": "partner",
    "counselor": "counselor",
    "team leader": "teamleader",   // ✅ FIXED
    "teamleader": "teamleader"     // ✅ FIXED
};

// 🔥 appRole → DB role name
const DB_ROLE_MAP = {
    superadmin: "super admin",
    admin: "property manager",
    partner: "partner",
    counselor: "counselor",
    teamleader: "team leader"
};

/* ================= ROLE HELPERS ================= */

// DB → App role
export const mapRoleForApp = (roleName) => {
    if (!roleName) return "user";
    const normalized = roleName.toLowerCase().trim();
    return ROLE_MAP[normalized] || "user";
};

// App → DB role name
export const getDbRoleKey = (appRole) => {
    return DB_ROLE_MAP[appRole];
};

/* ================= ROLE CACHE ================= */

let roleCache = null;
let roleCachePromise = null;

// 🔥 roleName → ObjectId
export const getRoleMap = async () => {
    if (roleCache) return roleCache;

    if (roleCachePromise) return roleCachePromise;

    roleCachePromise = (async () => {
        const roles = await Role.find().lean();

        const map = {};
        roles.forEach((r) => {
            map[r.role.toLowerCase()] = r._id;
        });

        roleCache = map;
        roleCachePromise = null;

        return roleCache;
    })();

    return roleCachePromise;
};

// 🔥 DIRECT helper (best usage)
export const getRoleId = async (appRole) => {
    // ✅ correct ObjectId detection
    if (mongoose.Types.ObjectId.isValid(appRole)) {
        return appRole;
    }

    const roleIdMap = await getRoleMap();
    const dbKey = getDbRoleKey(appRole);

    if (!dbKey) {
        console.error("❌ DB_ROLE_MAP missing for:", appRole);
        return null;
    }

    if (!roleIdMap[dbKey]) {
        console.error("❌ Role not found in DB:", dbKey);
        return null;
    }

    return roleIdMap[dbKey];
};

// 🔁 Optional: reset cache (if roles change)
export const resetRoleCache = () => {
    roleCache = null;
};