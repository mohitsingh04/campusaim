import { API } from "../API";

export const fetchSuperadminDashboard = async (range = "30d") => {
    try {
        const { data } = await API.get("/superadmin/dashboard", {
            params: { range }
        });

        return data || {};
    } catch (error) {
        console.error("Super Admin's Dashboard API Fetch failed:", error.message);
        throw error;
    }
};

export const fetchAdminDashboard = async (range = "30d") => {
    try {
        const { data } = await API.get("/admin/dashboard", {
            params: { range }
        });

        return data || {};
    } catch (error) {
        console.error("Admin's Dashboard API Fetch failed:", error.message);
        throw error;
    }
};

export const fetchCounselorDashboard = async (range = "30d") => {
    try {
        const { data } = await API.get("/counselor/dashboard", {
            params: { range }
        });

        return data || {};
    } catch (error) {
        console.error("Counselor's Dashboard API Fetch failed:", error.message);
        throw error;
    }
};

export const fetchTeamLeaderDashboard = async (range = "30d", groupBy = "month") => {
    try {
        const { data } = await API.get("/team-leader/dashboard", {
            params: { range, groupBy }, // ✅ added
        });

        return data || {};
    } catch (error) {
        console.error("Team Leader Dashboard API Fetch failed:", error.message);
        throw error;
    }
};

export const fetchPartnerDashboard = async (range = "30d") => {
    try {
        const { data } = await API.get("/partner/dashboard", {
            params: { range }
        });

        return data || {};
    } catch (error) {
        console.error("Partner's Dashboard API Fetch failed:", error.message);
        throw error;
    }
};