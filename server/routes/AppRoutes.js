import express from "express";
import {
    addUser,
    updateUser,
    fetchAdmins,
    fetchAdminById,
    fetchCounselors,
    fetchCounselorById,
    fetchTeamLeader,
    fetchTeamLeaderById,
    fetchPartner,
    fetchPartnerById,
    toggleUserStatus,
    getPartnerInvite,
    generatePartnerInvite,
    registerPartnerViaInvite,
} from "../app_controller/UserController.js";

const appRouter = express.Router();

// Profile
// appRouter.post("/update-profile", addUser);

// Add user By Role
appRouter.post("/add-user", addUser);
appRouter.put("/update-user/:id", updateUser);
appRouter.get("/fetch-admins", fetchAdmins);
appRouter.get("/fetch-admins/:id", fetchAdminById);
appRouter.get("/fetch-counselors", fetchCounselors);
appRouter.get("/fetch-counselor/:id", fetchCounselorById);
appRouter.get("/fetch-teamleader", fetchTeamLeader);
appRouter.get("/fetch-teamleader/:id", fetchTeamLeaderById);
appRouter.get("/fetch-partner", fetchPartner);
appRouter.get("/fetch-partner/:id", fetchPartnerById);

// Toggle User Status
appRouter.post('/toggle-status/:id', toggleUserStatus);

// Partner Invite
appRouter.get("/invites/partner", getPartnerInvite);
appRouter.post("/invites/partner", generatePartnerInvite);
appRouter.post("/auth/partner/register/:token", registerPartnerViaInvite);

export default appRouter;