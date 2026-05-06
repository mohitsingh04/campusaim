import express from "express";
import {
    activityTracker,
    addUser,
    aiChatBot,
    becomeAPartner,
    deleteMultiUser,
    deleteUser,
    fetchAdminById,
    fetchAdmins,
    fetchAllPermissions,
    fetchAllUsers,
    fetchUsers,
    fetchCounselorById,
    fetchCounselors,
    fetchMyAdmins,
    fetchPartnerById,
    fetchPartners,
    fetchTeamLeader,
    fetchTeamLeaderById,
    generatePartnerInvite,
    getAdminOverview,
    getAssignableUsers,
    getCounselorsForTeamLeader,
    getPartnerInvite,
    registerPartnerViaInvite,
    toggleUserStatus,
    updateUser,
    updateUserNiche,
    updateUserOrganization
} from "../controller/userController.js";
import { fetchMyOrganization } from "../controller/organizationController.js";

const userRouter = express.Router();

// User Routes
userRouter.get("/user", fetchAllUsers);

// All Admins
userRouter.get("/fetch-admin", fetchAdmins);
userRouter.get("/fetch-admin/:uniqueId", fetchAdminById);
userRouter.get("/admin/:id/overview", getAdminOverview);

// All Counselors
userRouter.get("/fetch-counselor", fetchCounselors);
userRouter.get("/fetch-counselor/:uniqueId", fetchCounselorById);

// All Teamleader
userRouter.get("/fetch-team-leader", fetchTeamLeader);
userRouter.get("/fetch-team-leader/:uniqueId", fetchTeamLeaderById);

// All Partner
userRouter.get("/fetch-partner", fetchPartners);
userRouter.get("/fetch-partner/:uniqueId", fetchPartnerById);

// Admin Routes
userRouter.get("/admins", fetchMyAdmins);

userRouter.get("/fetch/users", fetchUsers);
userRouter.get("/admin/assignable-users", getAssignableUsers);
userRouter.get("/teamleader/counselors", getCounselorsForTeamLeader);


// CRUD Users
userRouter.post("/add-user", addUser);
userRouter.put("/update-user/:uniqueId", updateUser);
userRouter.delete("/delete-user/:id", deleteUser);
userRouter.delete("/delete-multiple-user", deleteMultiUser);

// Toggle User Status
userRouter.post('/toggle-status/:id', toggleUserStatus);

// Permissions
userRouter.get('/fetch-permissions', fetchAllPermissions);

// Counselor's Activity Tracker
userRouter.post('/counselor/activity', activityTracker);

// AI Chatbot
userRouter.post('/chat', aiChatBot);

// Partner Invite
userRouter.get("/invites/partner", getPartnerInvite);
userRouter.post("/invites/partner", generatePartnerInvite);
userRouter.post("/auth/partner/register/:token", registerPartnerViaInvite);

// Become a partner
userRouter.post("/become-a-partner", becomeAPartner);

// Update User Niche
userRouter.put("/users/update-niche", updateUserNiche);

// Update User Organization
userRouter.get("/my-organization", fetchMyOrganization);
userRouter.put("/users/update-organization", updateUserOrganization);

export default userRouter;