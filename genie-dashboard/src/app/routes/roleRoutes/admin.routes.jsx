import AdminDashboard from "../../pages/dashboard/AdminDashboard";

/* ===== COUNSELORS ===== */
import AllCounselor from "../../pages/users/counselor/AllCounselor";
import AddCounselor from "../../pages/users/counselor/AddCounselor";
import ViewCounselor from "../../pages/users/counselor/ViewCounselor";
import EditCounselor from "../../pages/users/counselor/EditCounselor";

/* ===== PARTNERS ===== */
import AllPartner from "../../pages/users/partner/AllPartner";
import AddPartner from "../../pages/users/partner/AddPartner";
import EditPartner from "../../pages/users/partner/EditPartner";
import ViewPartner from "../../pages/users/partner/ViewPartner";

/* ===== TEAM LEADERS ===== */
import AllTeamLeader from "../../pages/users/teamLeader/AllTeamLeader";
import AddTeamLeader from "../../pages/users/teamLeader/AddTeamLeader";
import EditTeamLeader from "../../pages/users/teamLeader/EditTeamLeader";
import ViewTeamLeader from "../../pages/users/teamLeader/ViewTeamLeader";

/* ===== LEADS ===== */
import AllLead from "../../pages/leads/AllLead";
import AddLead from "../../pages/leads/AddLead";
import EditLead from "../../pages/leads/EditLead";
import ViewLead from "../../pages/leads/ViewLead";
import BulkLeadUpload from "../../pages/leads/BulkLeadUpload";
import LeadConversation from "../../pages/leads/LeadConversation";

/* ===== QUESTIONS ===== */
import QuestionList from "../../pages/questions/QuestionList";
import AddQuestion from "../../pages/questions/AddQuestion";
import EditQuestion from "../../pages/questions/EditQuestion";
import ViewQuestion from "../../pages/questions/ViewQuestion";

/* ===== SUPPORT ===== */
import MySupport from "../../pages/support/MySupport";
import AddSupport from "../../pages/support/AddSupport";
import EditSupport from "../../pages/support/EditSupport";
import ViewSupport from "../../pages/support/ViewSupport";

/* ===== SETTINGS & MORE ===== */
import SettingPage from "../../pages/setting/SettingPage";
import NotificationsPage from "../../pages/notification/NotificationsPage";
import AssignedGoals from "../../pages/goals/AssignedGoals";
import WithdrawRequest from "../../pages/incentive/WithdrawRequest";

export const adminRoutes = [
    /* ===== DASHBOARD ===== */
    { path: "/", element: <AdminDashboard /> },

    /* ===== COUNSELORS ===== */
    { path: "users/counselors", element: <AllCounselor /> },
    { path: "users/counselors/add", element: <AddCounselor /> },
    { path: "users/counselors/edit/:id", element: <EditCounselor /> },
    { path: "users/counselors/view/:id", element: <ViewCounselor /> },

    /* ===== PARTNERS ===== */
    { path: "users/partners", element: <AllPartner /> },
    { path: "users/partners/add", element: <AddPartner /> },
    { path: "users/partners/edit/:id", element: <EditPartner /> },
    { path: "users/partners/view/:id", element: <ViewPartner /> },

    /* ===== TEAM LEADERS ===== */
    { path: "users/team-leaders", element: <AllTeamLeader /> },
    { path: "users/team-leaders/add", element: <AddTeamLeader /> },
    { path: "users/team-leaders/edit/:id", element: <EditTeamLeader /> },
    { path: "users/team-leaders/view/:id", element: <ViewTeamLeader /> },

    /* ===== LEADS ===== */
    { path: "leads/all", element: <AllLead /> },
    { path: "leads/add", element: <AddLead /> },
    { path: "leads/add/bulk", element: <BulkLeadUpload /> },
    { path: "leads/edit/:id", element: <EditLead /> },
    { path: "leads/view/:id", element: <ViewLead /> },
    { path: "leads/conversation/:id", element: <LeadConversation /> },

    /* ===== QUESTIONS ===== */
    { path: "questions/all", element: <QuestionList /> },
    { path: "questions/add", element: <AddQuestion /> },
    { path: "questions/edit/:id", element: <EditQuestion /> },
    { path: "questions/view/:id", element: <ViewQuestion /> },

    /* ===== SUPPORT ===== */
    { path: "my-support", element: <MySupport /> },
    { path: "support/add", element: <AddSupport /> },
    { path: "support/edit/:id", element: <EditSupport /> },
    { path: "support/view/:id", element: <ViewSupport /> },

    /* ===== Goals ===== */
    { path: "assigned-goals", element: <AssignedGoals /> },

    /* ===== WITHDRAW REQUEST ===== */
    { path: "withdraw-request", element: <WithdrawRequest /> },

    /* ===== Settings & More ===== */
    { path: "settings", element: <SettingPage /> },
    { path: "notifications", element: <NotificationsPage /> }
];
