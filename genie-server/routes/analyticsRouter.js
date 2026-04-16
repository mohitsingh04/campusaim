import express from "express";
import { getAdminAnalytics, getAdminDashboard, getCounselorAnalytics, getCounselorDashboard, getPartnerAnalytics, getPartnerDashboard, getSuperadminDashboard, getTeamLeaderAnalytics, getTeamLeaderDashboard } from "../controller/analyticsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { deleteAllErrorLogs, deleteErrorLog, deleteMultipleErrorLogs, getErrorLogs, logFrontendError } from "../controller/errorLogController.js";

const analyticsRouter = express.Router();

// Superadmin Dashboard Details
analyticsRouter.get("/superadmin/dashboard", getSuperadminDashboard);

// Admin Dashboard Details
analyticsRouter.get("/admin/dashboard", getAdminDashboard);

// Counselor Dashboard Details
analyticsRouter.get("/counselor/dashboard", getCounselorDashboard);

// Partner Dashboard Details
analyticsRouter.get("/partner/dashboard", getPartnerDashboard);

// Team Leader Dashboard Details
analyticsRouter.get("/team-leader/dashboard", getTeamLeaderDashboard);

// Admin Analytics Details
analyticsRouter.get("/admin/:id/analytics", getAdminAnalytics);

// Team Leader Analytics Details
analyticsRouter.get("/analytics/teamleader/:teamLeaderId", getTeamLeaderAnalytics);

// Partner Analytics Details
analyticsRouter.get("/analytics/partner/:partnerId", getPartnerAnalytics);

// Counselor Analytics Details
analyticsRouter.get("/analytics/counselor/:counselorId", getCounselorAnalytics);

// Error Log Router
analyticsRouter.get("/error-logs", getErrorLogs);
analyticsRouter.post("/error-logs", logFrontendError);
analyticsRouter.delete("/error-logs/all", deleteAllErrorLogs);
analyticsRouter.delete("/error-logs", deleteMultipleErrorLogs);
analyticsRouter.delete("/error-logs/:id", deleteErrorLog);

export default analyticsRouter;