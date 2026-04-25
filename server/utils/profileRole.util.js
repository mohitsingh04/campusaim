// utils/profileRole.util.js
import { ProfileRoles } from "../profile-model/ProfileRoles.js";

const roleCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 min

const normalize = (val) => val.trim().toLowerCase();

export const getRoleIds = async (input) => {
    try {
        if (!input) throw new Error("Role input required");

        const roleNames = Array.isArray(input)
            ? input.map(normalize)
            : [normalize(input)];

        const results = [];
        const missing = [];

        // 1. Cache check
        for (const name of roleNames) {
            const cached = roleCache.get(name);

            if (cached && cached.expiry > Date.now()) {
                results.push(cached.data);
            } else {
                missing.push(name);
            }
        }

        // 2. DB fetch (case-insensitive)
        if (missing.length) {
            const roles = await ProfileRoles.find({
                role: { $in: missing.map(r => new RegExp(`^${r}$`, "i")) }
            }).lean();

            for (const role of roles) {
                const key = normalize(role.role);

                roleCache.set(key, {
                    data: role._id.toString(),
                    expiry: Date.now() + CACHE_TTL
                });

                results.push(role._id.toString());
            }
        }

        // 3. Strict validation
        if (results.length !== roleNames.length) {
            throw new Error("Some roles not found");
        }

        return Array.isArray(input) ? results : results[0];

    } catch (err) {
        throw new Error(`getRoleIds failed: ${err.message}`);
    }
};

// Optional
export const clearRoleCache = () => roleCache.clear();