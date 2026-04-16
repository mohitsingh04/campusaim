import TeamLeadDashboard from "../../pages/dashboard/TeamLeadDashboard";

/* ===== COUNSELORS ===== */
import EditCounselor from "../../pages/users/counselor/EditCounselor";
import ViewCounselor from "../../pages/users/counselor/ViewCounselor";
import AssignedCounselors from "../../pages/users/teamLeader/AssignedCounselors";

/* ===== LEADS ===== */
import AddLead from "../../pages/leads/AddLead";
import AllLead from "../../pages/leads/AllLead";
import EditLead from "../../pages/leads/EditLead";
import LeadConversation from "../../pages/leads/LeadConversation";
import ViewLead from "../../pages/leads/ViewLead";

/* ===== SUPPORT ===== */
import AddSupport from "../../pages/support/AddSupport";
import EditSupport from "../../pages/support/EditSupport";
import MySupport from "../../pages/support/MySupport";
import ViewSupport from "../../pages/support/ViewSupport";

/* ===== Settings & More ===== */
import SettingPage from "../../pages/setting/SettingPage";
import NotificationsPage from "../../pages/notification/NotificationsPage";
import Incentive from "../../pages/incentive/Incentive";

export const teamleaderRoutes = [
    { path: "/", element: <TeamLeadDashboard /> },

    /* ===== COUNSELORS ===== */
    { path: "users/counselors/assigned", element: <AssignedCounselors /> },
    { path: "users/counselors/view/:id", element: <ViewCounselor /> },
    { path: "users/counselors/edit/:id", element: <EditCounselor /> },

    /* ===== LEADS ===== */
    { path: "leads/all", element: <AllLead /> },
    { path: "leads/add", element: <AddLead /> },
    { path: "leads/edit/:id", element: <EditLead /> },
    { path: "leads/view/:id", element: <ViewLead /> },
    { path: "leads/conversation/:id", element: <LeadConversation /> },

    /* ===== SUPPORT ===== */
    { path: "my-support", element: <MySupport /> },
    { path: "support/add", element: <AddSupport /> },
    { path: "support/edit/:id", element: <EditSupport /> },
    { path: "support/view/:id", element: <ViewSupport /> },

    /* ===== INCENTIVE ===== */
    { path: "my-incentive", element: <Incentive /> },

    /* ===== Settings & More ===== */
    { path: "settings", element: <SettingPage /> },
    { path: "notifications", element: <NotificationsPage /> }
];
