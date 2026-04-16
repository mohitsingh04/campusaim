import CounselorDashboard from "../../pages/dashboard/CounselorDashboard";
import CounselorGoals from "../../pages/goals/CounselorGoals";

/* ===== LEADS ===== */
import AddLead from "../../pages/leads/AddLead";
import AllLead from "../../pages/leads/AllLead";
import EditLead from "../../pages/leads/EditLead";
import LeadConversation from "../../pages/leads/LeadConversation";
import ViewLead from "../../pages/leads/ViewLead";
import NotificationsPage from "../../pages/notification/NotificationsPage";

/* ===== SUPPORT ===== */
import AddSupport from "../../pages/support/AddSupport";
import EditSupport from "../../pages/support/EditSupport";
import MySupport from "../../pages/support/MySupport";
import ViewSupport from "../../pages/support/ViewSupport";

/* ===== FOLLOW-UP ===== */
import FollowUp from "../../pages/followUps/FollowUp";

/* ===== Settings & More ===== */
import SettingPage from "../../pages/setting/SettingPage";
import Test from "../../pages/test/Test";
import Incentive from "../../pages/incentive/Incentive";

export const counselorRoutes = [
    { path: "/", element: <CounselorDashboard /> },

    /* ===== LEADS ===== */
    { path: "leads/all", element: <AllLead /> },
    { path: "leads/add", element: <AddLead /> },
    { path: "leads/edit/:id", element: <EditLead /> },
    { path: "leads/view/:id", element: <ViewLead /> },
    { path: "leads/conversation/:id", element: <LeadConversation /> },

    /* ===== Goals ===== */
    { path: "my-goals", element: <CounselorGoals /> },

    /* ===== SUPPORT ===== */
    { path: "my-support", element: <MySupport /> },
    { path: "support/add", element: <AddSupport /> },
    { path: "support/edit/:id", element: <EditSupport /> },
    { path: "support/view/:id", element: <ViewSupport /> },

    /* ===== FOLLOW-UP ===== */
    { path: "follow-ups", element: <FollowUp /> },

    /* ===== INCENTIVE ===== */
    { path: "my-incentive", element: <Incentive /> },

    /* ===== Settings & More ===== */
    { path: "settings", element: <SettingPage /> },
    { path: "notifications", element: <NotificationsPage /> },
    { path: "test", element: <Test /> }
];
