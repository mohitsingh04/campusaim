// import { useEffect, useState } from "react";
// import { User, Shield, Locate, DollarSign, FileText, Building2, HelpCircle } from "lucide-react";
// import Profile from "./profile/Profile.jsx";
// import Security from "./security/Security.jsx";
// import Location from "./location/Location.jsx";
// import Documents from "./documents/Documents.jsx";
// import BankDetails from "./bank_details/BankDetails.jsx";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext.jsx";
// import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs.jsx";

// /* ---------------- TAB DEFINITIONS ---------------- */

// const TAB_DEFS = {
//   profile: { id: "profile", label: "Profile", icon: User },
//   location: { id: "location", label: "Location", icon: Locate },
//   documents: { id: "documents", label: "Documents", icon: FileText },
//   bankDetails: { id: "bankDetails", label: "Bank Details", icon: DollarSign },
//   security: { id: "security", label: "Security", icon: Shield },
//   questions: { id: "questions", label: "Questions", icon: HelpCircle },
// };

// /* ---------------- ROLE → TAB MAP ---------------- */

// const ROLE_TABS = {
//   superadmin: [
//     TAB_DEFS.profile,
//     TAB_DEFS.location,
//     TAB_DEFS.security,
//   ],
//   admin: [
//     TAB_DEFS.profile,
//     TAB_DEFS.location,
//     TAB_DEFS.questions,
//     TAB_DEFS.security,
//   ],
//   partner: [
//     TAB_DEFS.profile,
//     TAB_DEFS.location,
//     TAB_DEFS.documents,
//     TAB_DEFS.bankDetails,
//     TAB_DEFS.security,
//   ],
//   teamleader: [
//     TAB_DEFS.profile,
//     TAB_DEFS.location,
//     TAB_DEFS.documents,
//     TAB_DEFS.bankDetails,
//     TAB_DEFS.security,
//   ],
//   counselor: [
//     TAB_DEFS.profile,
//     TAB_DEFS.location,
//     TAB_DEFS.documents,
//     TAB_DEFS.bankDetails,
//     TAB_DEFS.security,
//   ],
// };

// function SettingPage() {
//   const navigate = useNavigate();
//   const { authUser } = useAuth();
//   const [searchParams, setSearchParams] = useSearchParams();

//   const role = authUser?.appRole;
//   const tabs = ROLE_TABS[role] || ROLE_TABS.partner;

//   const urlTab = searchParams.get("tab");
//   const initialTab = urlTab || "profile";
//   const [activeTab, setActiveTab] = useState(initialTab);

//   /* ---------- Block invalid tab via URL ---------- */
//   useEffect(() => {
//     if (!authUser) return; // ⛔ wait until role is known

//     if (!tabs.some((t) => t.id === activeTab)) {
//       setActiveTab("profile");
//     }
//   }, [activeTab, tabs, authUser]);

//   useEffect(() => {
//     setSearchParams({ tab: activeTab });
//   }, [activeTab, setSearchParams]);

//   const renderTabPanel = () => {
//     if (!tabs.some((t) => t.id === activeTab)) {
//       return <Profile />;
//     }

//     switch (activeTab) {
//       case "profile":
//         return <Profile />;
//       case "location":
//         return <Location />;
//       case "security":
//         return <Security />;
//       case "documents":
//         return <Documents />;
//       case "bankDetails":
//         return <BankDetails />;
//       case "questions":
//         return (navigate("/dashboard/questions/all"));
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Breadcrumbs */}
//       <Breadcrumbs
//         items={[
//           { label: "Dashboard", to: "/dashboard" },
//           { label: "Settings" },
//         ]}
//       />

//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* Tabs */}
//         <div className="lg:w-64">
//           {/* Mobile: horizontal scroll */}
//           <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
//             {tabs.map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`
//             flex items-center justify-center lg:justify-start
//             px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap
//             transition-colors
//             ${activeTab === tab.id
//                     ? "bg-blue-600 text-white lg:bg-blue-50 lg:text-blue-600 lg:border-r-2 lg:border-blue-600"
//                     : "text-gray-700 hover:bg-gray-100"
//                   }
//           `}
//               >
//                 <tab.icon className="w-5 h-5 mr-2 lg:mr-3 shrink-0" />
//                 {tab.label}
//               </button>
//             ))}
//           </nav>
//         </div>

//         {/* Content */}
//         <div className="flex-1">
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
//             {renderTabPanel()}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SettingPage;

import React from "react";
import { Pencil } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs.jsx";

export default function SettingPage() {
  const { authUser } = useAuth();
  const navigate = useNavigate();

  if (!authUser) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  const {
    name,
    username,
    email,
    mobile_no,
    roleName,
    status,
    verified,
    city,
    state,
    country,
    profile_image,
    createdAt,
    avatar
  } = authUser;

  const avatarUrl = authUser?.avatar?.[0]
    ? `${import.meta.env.VITE_MEDIA_URL}${authUser.avatar[0]}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser?.name || "User")}&background=0D8ABC&color=fff`;

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Breadcrumbs
          items={[
            { label: "Dashboard", to: "/dashboard" },
            { label: "Profile" },
          ]}
        />

        <Link
          to={`${import.meta.env.VITE_CAMPUSAIM_URL}/settings/account?tab=profile`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Pencil size={16} />
          Edit Profile
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white shadow-sm rounded-xl p-6 border">

        {/* Top Section */}
        <div className="flex items-center gap-6 mb-6">
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border"
          />

          <div>
            <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
            <p className="text-sm text-gray-500">@{username}</p>
            <p className="text-sm text-gray-600 mt-1">{roleName}</p>

            <div className="mt-2 flex gap-2">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}>
                {status}
              </span>

              <span className={`px-2 py-1 text-xs rounded-full font-medium ${verified
                ? "bg-blue-100 text-blue-700"
                : "bg-yellow-100 text-yellow-700"
                }`}>
                {verified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium text-gray-800">{email || "N/A"}</p>
          </div>

          <div>
            <p className="text-gray-500">Mobile</p>
            <p className="font-medium text-gray-800">{mobile_no || "N/A"}</p>
          </div>

          <div>
            <p className="text-gray-500">City</p>
            <p className="font-medium text-gray-800">{city || "N/A"}</p>
          </div>

          <div>
            <p className="text-gray-500">State</p>
            <p className="font-medium text-gray-800">{state || "N/A"}</p>
          </div>

          <div>
            <p className="text-gray-500">Country</p>
            <p className="font-medium text-gray-800">{country || "N/A"}</p>
          </div>

          <div>
            <p className="text-gray-500">Joined</p>
            <p className="font-medium text-gray-800">
              {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}