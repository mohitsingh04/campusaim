import { getRoleIds } from "./profileRole.util.js";

export const hasRole = async (user, allowedRoles = []) => {
    if (!user?.role) return false;

    const roleIds = await getRoleIds(allowedRoles); // ["Admin", "Counselor"]

    const allowed = Array.isArray(roleIds) ? roleIds : [roleIds];

    return allowed.includes(user.role.toString());
};