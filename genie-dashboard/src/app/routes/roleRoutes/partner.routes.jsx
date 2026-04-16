import PartnerDashboard from "../../pages/dashboard/PartnerDashboard";

/* ===== LEADS ===== */
import AllLead from "../../pages/leads/AllLead";
import EditLead from "../../pages/leads/EditLead";
import LeadConversation from "../../pages/leads/LeadConversation";
import ViewLead from "../../pages/leads/ViewLead";

/* ===== SUPPORT ===== */
import MySupport from "../../pages/support/MySupport";
import AddSupport from "../../pages/support/AddSupport";
import EditSupport from "../../pages/support/EditSupport";
import ViewSupport from "../../pages/support/ViewSupport";

/* ===== COMISSION ===== */
import MyComission from "../../pages/comission/MyComission";

/* ===== Settings & More ===== */
import SettingPage from "../../pages/setting/SettingPage";
import NotificationsPage from "../../pages/notification/NotificationsPage";

export const partnerRoutes = [
    { path: "/", element: <PartnerDashboard /> },

    /* ===== LEADS ===== */
    { path: "leads/all", element: <AllLead /> },
    { path: "leads/edit/:id", element: <EditLead /> },
    { path: "leads/view/:id", element: <ViewLead /> },
    { path: "leads/conversation/:id", element: <LeadConversation /> },

    /* ===== SUPPORT ===== */
    { path: "my-support", element: <MySupport /> },
    { path: "support/add", element: <AddSupport /> },
    { path: "support/edit/:id", element: <EditSupport /> },
    { path: "support/view/:id", element: <ViewSupport /> },

    /* ===== COMISSION ===== */
    { path: "my-comission", element: <MyComission /> },

    /* ===== Settings & More ===== */
    { path: "settings", element: <SettingPage /> },
    { path: "notifications", element: <NotificationsPage /> }
];
