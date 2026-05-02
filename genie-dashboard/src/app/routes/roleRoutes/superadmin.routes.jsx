import SuperadminDashboard from "../../pages/dashboard/SuperadminDashboard";

// Admin Pages
import AllAdmin from "../../pages/users/admin/AllAdmin";
import ViewAdmin from "../../pages/users/admin/ViewAdmin";
import EditAdmin from "../../pages/users/admin/EditAdmin";

/* ===== NICHE ===== */
import AllNiche from "../../pages/niche/AllNiche";
import AddNiche from "../../pages/niche/AddNiche";
import EditNiche from "../../pages/niche/EditNiche";
import ViewNiche from "../../pages/niche/ViewNiche";

/* ===== QUESTIONS SET ===== */
import AllQuestionSet from "../../pages/questionSets/question-set/AllQuestionSet";
import AddQuestionSet from "../../pages/questionSets/question-set/AddQuestionSet";
import EditQuestionSet from "../../pages/questionSets/question-set/EditQuestionSet";
import ViewQuestionSet from "../../pages/questionSets/question-set/ViewQuestionSet";

/* ===== SUPPORT ===== */
import AllSupport from "../../pages/support/AllSupport";
import ViewSupport from "../../pages/support/ViewSupport";

/* ===== NOTIFICATION ===== */
import NotificationsPage from "../../pages/notification/NotificationsPage";

/* ===== SETTING ===== */
import SettingPage from "../../pages/setting/SettingPage";

// Other Pages
import ErrorLogs from "../../pages/errorLogs/ErrorLogs";
import SystemHealth from "../../pages/administrativePages/SystemHealth";
import Test from "../../pages/test/Test";

export const superadminRoutes = [
    { path: "/", element: <SuperadminDashboard /> },

    // Admin Pages
    { path: "admins", element: <AllAdmin /> },
    { path: "admins/edit/:id", element: <EditAdmin /> },
    { path: "admins/view/:id", element: <ViewAdmin /> },

    /* ===== NICHE ===== */
    { path: "niche/all", element: <AllNiche /> },
    { path: "niche/add", element: <AddNiche /> },
    { path: "niche/edit/:id", element: <EditNiche /> },
    { path: "niche/view/:id", element: <ViewNiche /> },

    /* ===== QUESTIONS SETS ===== */
    { path: "question-set/all", element: <AllQuestionSet /> },
    { path: "question-set/add", element: <AddQuestionSet /> },
    { path: "question-set/edit/:slug", element: <EditQuestionSet /> },
    { path: "question-set/view/:slug", element: <ViewQuestionSet /> },

    /* ===== SUPPORT ===== */
    { path: "support", element: <AllSupport /> },
    { path: "support/view/:id", element: <ViewSupport /> },
    
    /* ===== NOTIFICATION ===== */
    { path: "notifications", element: <NotificationsPage /> },

    /* ===== SETTING ===== */
    { path: "settings", element: <SettingPage /> },

    // Other Pages
    { path: "error-logs", element: <ErrorLogs /> },
    { path: "system-health", element: <SystemHealth /> },
    { path: "test", element: <Test /> }
];