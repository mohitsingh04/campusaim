import { useEffect, useState } from "react";
import { User, Shield, Locate, DollarSign, FileText, Building2, HelpCircle } from "lucide-react";
import Profile from "./profile/Profile.jsx";
import Security from "./security/Security.jsx";
import Location from "./location/Location.jsx";
import Documents from "./documents/Documents.jsx";
import BankDetails from "./bank_details/BankDetails.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs.jsx";

/* ---------------- TAB DEFINITIONS ---------------- */

const TAB_DEFS = {
  profile: { id: "profile", label: "Profile", icon: User },
  location: { id: "location", label: "Location", icon: Locate },
  documents: { id: "documents", label: "Documents", icon: FileText },
  bankDetails: { id: "bankDetails", label: "Bank Details", icon: DollarSign },
  security: { id: "security", label: "Security", icon: Shield },
  questions: { id: "questions", label: "Questions", icon: HelpCircle },
};

/* ---------------- ROLE → TAB MAP ---------------- */

const ROLE_TABS = {
  superadmin: [
    TAB_DEFS.profile,
    TAB_DEFS.location,
    TAB_DEFS.security,
  ],
  admin: [
    TAB_DEFS.profile,
    TAB_DEFS.location,
    TAB_DEFS.questions,
    TAB_DEFS.security,
  ],
  partner: [
    TAB_DEFS.profile,
    TAB_DEFS.location,
    TAB_DEFS.documents,
    TAB_DEFS.bankDetails,
    TAB_DEFS.security,
  ],
  teamleader: [
    TAB_DEFS.profile,
    TAB_DEFS.location,
    TAB_DEFS.documents,
    TAB_DEFS.bankDetails,
    TAB_DEFS.security,
  ],
  counselor: [
    TAB_DEFS.profile,
    TAB_DEFS.location,
    TAB_DEFS.documents,
    TAB_DEFS.bankDetails,
    TAB_DEFS.security,
  ],
};

function SettingPage() {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const role = authUser?.appRole;
  const tabs = ROLE_TABS[role] || ROLE_TABS.partner;

  const urlTab = searchParams.get("tab");
  const initialTab = urlTab || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  /* ---------- Block invalid tab via URL ---------- */
  useEffect(() => {
    if (!authUser) return; // ⛔ wait until role is known

    if (!tabs.some((t) => t.id === activeTab)) {
      setActiveTab("profile");
    }
  }, [activeTab, tabs, authUser]);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const renderTabPanel = () => {
    if (!tabs.some((t) => t.id === activeTab)) {
      return <Profile />;
    }

    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "location":
        return <Location />;
      case "security":
        return <Security />;
      case "documents":
        return <Documents />;
      case "bankDetails":
        return <BankDetails />;
      case "questions":
        return (navigate("/dashboard/questions/all"));
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Settings" },
        ]}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64">
          {/* Mobile: horizontal scroll */}
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
            flex items-center justify-center lg:justify-start
            px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap
            transition-colors
            ${activeTab === tab.id
                    ? "bg-blue-600 text-white lg:bg-blue-50 lg:text-blue-600 lg:border-r-2 lg:border-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                  }
          `}
              >
                <tab.icon className="w-5 h-5 mr-2 lg:mr-3 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            {renderTabPanel()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingPage;
