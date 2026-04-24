import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Phone, Mail, MapPin, Pencil, ArrowLeft, Lock, RefreshCw } from "lucide-react";
import { API, CampusaimAPI } from "../../services/API";
import BasicDetails from "./ViewLeadTabs/BasicDetails";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import Summary from "./ViewLeadTabs/Summary";
import Analytics from "./ViewLeadTabs/Analytics";
import AssignmentHistory from "./ViewLeadTabs/AssignmentHistory";
import ViewLeadSkeleton from "./Skeleton/ViewLeadSkeleton";
import ConversationHistory from "./ViewLeadTabs/ConversationHistory";
import { useAuth } from "../../context/AuthContext";
import LeadTimeline from "./ViewLeadTabs/LeadTimeline";
import LeadStatusBadge from "../../components/ui/Badge/LeadStatusBadge";
import FollowUpAlert from "../../components/ui/FollowUpAlert/FollowUpAlert";
import UpdateStatusModal from "../../components/modal/UpdateStatusModal";
import toast from "react-hot-toast";

const ROLE_TABS = {
    superadmin: ["analytics", "details", "assignmentHistory", "summary", "conversationHistory"],
    admin: ["analytics", "details", "assignmentHistory", "summary", "conversationHistory", "leadTimeline"],
    partner: ["details"],
    counselor: ["details", "summary", "conversationHistory"],
    teamleader: ["details", "summary", "conversationHistory"],
};
const DEFAULT_TAB = "details";

const btnBase = "w-full flex items-center justify-center px-3 py-2 rounded-lg text-white transition font-medium";

const btnVariants = {
    success: "bg-green-600 hover:bg-green-700",
    primary: "bg-blue-600 hover:bg-blue-700",
    secondary: "bg-indigo-600 hover:bg-indigo-700",
    warning: "bg-amber-500 hover:bg-amber-600",
    disabled: "bg-gray-400 cursor-not-allowed",
};

function ViewLead() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [hasConversation, setHasConversation] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const role = authUser?.appRole;

    const [leadData, setLeadData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [followUp, setFollowUp] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [options, setOptions] = useState([]);
    const [courses, setCourses] = useState([]);

    const fetchCourse = async () => {
        try {
            const { data } = await CampusaimAPI.get("/course");
            setCourses(data);
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchCourse();
    }, []);

    const capitalizeRole = (role) =>
        role?.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await API.get(`/fetch/users`);

                setOptions(
                    (data?.data || []).map((u) => ({
                        value: u._id,
                        label: `${u.name} • ${capitalizeRole(u.role)} • ${u.email}`,
                        role: u.role
                    }))
                );

            } catch (error) {
                toast
                    .error(error.response.data.error || "Failed to load users");
            }
        };

        fetchUsers();
    }, []);

    const fetchLead = async () => {
        try {
            setIsLoading(true);

            const res = await API.get(`/leads/${id}`);
            const lead = res?.data;

            setLeadData(lead);

            if (lead?.nextFollowUp?.date) {
                setFollowUp({
                    date: lead.nextFollowUp.date,
                    time: lead.nextFollowUp.time,
                });
            } else {
                setFollowUp(null);
            }

            setHasConversation(!!lead?.hasConversation);

            setIsOwner(
                String(lead?.lastConversationBy) === String(authUser?._id)
            );

        } catch (error) {
            console.error("Lead fetch error:", error?.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchLead();
    }, [id, authUser?._id]);

    const allowedTabs = useMemo(() => {
        return ROLE_TABS[role] || ROLE_TABS.partner;
    }, [role]);

    const activeTab = useMemo(() => {
        const tab = searchParams.get("tab");
        return allowedTabs.includes(tab) ? tab : DEFAULT_TAB;
    }, [searchParams, allowedTabs]);

    const handleTabChange = (tab) => {
        setSearchParams({ tab });
    };

    const isClosedLead = ["converted", "lost"].includes(leadData?.status);
    const isPartner = authUser?.role === "partner";
    const canEditLead = ["admin", "counselor"].includes(role);

    const courseOptions = (courses || []).map((c) => ({
        value: c._id,
        label: c.course_name
    }));

    if (isLoading) {
        return <ViewLeadSkeleton />;
    }

    return (
        <>
            <div className="space-y-6">
                {/* ================= BREADCRUMBS ================= */}
                <Breadcrumbs
                    items={[
                        { label: "Dashboard", to: "/dashboard" },
                        { label: "Leads", to: "/dashboard/leads/all" },
                        { label: "Lead View" },
                    ]}
                    actions={[
                        canEditLead && {
                            label: "Edit",
                            to: `/dashboard/leads/edit/${id}`,
                            Icon: Pencil,
                            variant: "success",
                        },
                        {
                            label: "Back",
                            to: "/dashboard/leads/all",
                            Icon: ArrowLeft,
                            variant: "primary",
                        },
                    ].filter(Boolean)}
                />

                {/* ================= LEAD HEADER ================= */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEFT SECTION */}
                        <div className="lg:col-span-2 flex flex-col sm:flex-row gap-4">

                            {/* Avatar */}
                            <div className="w-16 h-16 min-w-[64px] bg-blue-100 rounded-xl flex items-center justify-center overflow-hidden border">
                                {leadData?.documents?.photo ? (
                                    <img
                                        src={`${import.meta.env.VITE_MEDIA_URL}${leadData.documents.photo}`}
                                        alt={leadData.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-blue-600 font-bold text-lg">
                                        {leadData?.name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-2">

                                {/* Name + Status */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                                        {leadData?.name}
                                    </h2>
                                    <LeadStatusBadge status={leadData?.status} />
                                </div>

                                {/* Meta */}
                                <div className="flex flex-col gap-2 text-sm text-gray-600">

                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="truncate">{leadData?.email || "N/A"}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{leadData?.contact || "N/A"}</span>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-[2px]" />
                                        <span className="leading-snug">
                                            {[leadData.address, leadData.city, leadData.state, leadData.country]
                                                .filter(Boolean)
                                                .join(", ") || "N/A"}
                                        </span>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* RIGHT SECTION → QUICK ACTIONS */}
                        {!isPartner && (
                            <div className="bg-gray-50 rounded-xl p-4 border flex flex-col justify-between">

                                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                    Quick Actions
                                </h3>

                                <div className="flex flex-col gap-2">

                                    {!hasConversation && !isClosedLead && (
                                        <button
                                            onClick={() =>
                                                navigate(`/dashboard/leads/conversation/${leadData?._id}`)
                                            }
                                            className={`${btnBase} ${btnVariants.success}`}
                                        >
                                            <Phone className="w-4 h-4 mr-2" />
                                            Start Conversation
                                        </button>
                                    )}

                                    {/* OLD */}
                                    {/* {hasConversation && isOwner && !isClosedLead && (
                                        <button
                                            onClick={() =>
                                                navigate(`/dashboard/leads/conversation/${leadData?._id}`)
                                            }
                                            className={`${btnBase} ${btnVariants.primary}`}
                                        >
                                            <Pencil className="w-4 h-4 mr-2" />
                                            Edit Conversation
                                        </button>
                                    )} */}

                                    {/* {hasConversation && !isClosedLead && (
                                        <button
                                            onClick={() =>
                                                navigate(`/dashboard/leads/conversation/${leadData?._id}?newSession=true`)
                                            }
                                            className={`${btnBase} ${btnVariants.secondary}`}
                                        >
                                            <Phone className="w-4 h-4 mr-2" />
                                            Restart Conversation
                                        </button>
                                    )} */}

                                    {/* NEW */}
                                    {hasConversation && isOwner && !isClosedLead && (
                                        <button
                                            onClick={() =>
                                                navigate(`/dashboard/leads/conversation/${leadData?._id}?mode=continue`)
                                            }
                                            className={`${btnBase} ${btnVariants.primary}`}
                                        >
                                            <Pencil className="w-4 h-4 mr-2" />
                                            Continue Conversation
                                        </button>
                                    )}

                                    {hasConversation && !isClosedLead && (
                                        <button
                                            onClick={() =>
                                                navigate(`/dashboard/leads/conversation/${leadData?._id}?mode=new`)
                                            }
                                            className={`${btnBase} ${btnVariants.secondary}`}
                                        >
                                            <Phone className="w-4 h-4 mr-2" />
                                            Start New Conversation
                                        </button>
                                    )}

                                    {isClosedLead && (
                                        <button
                                            disabled
                                            className={`${btnBase} ${btnVariants.disabled}`}
                                        >
                                            <Lock className="w-4 h-4 mr-2" />
                                            Conversation Closed
                                        </button>
                                    )}

                                    {role === "admin" && !isClosedLead && (
                                        <button
                                            onClick={() => setShowStatusModal(true)}
                                            className={`${btnBase} ${btnVariants.warning}`}
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Update Status
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ✅ FOLLOW-UP ALERT (GLOBAL POSITION) */}
                {!isClosedLead && followUp?.date && (
                    <FollowUpAlert
                        dateRaw={followUp.date}
                        timeRaw={followUp.time}
                        isClosed={isClosedLead}
                    />
                )}

                {/* ================= TABS ================= */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex gap-6 overflow-x-auto scrollbar-hide px-1">
                        {allowedTabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize
        ${activeTab === tab
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                {tab === "details" ? "Personal Details" : tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* ================= TAB CONTENT ================= */}
                {allowedTabs.includes("analytics") && activeTab === "analytics" && (
                    <Analytics leadId={leadData?._id} />
                )}

                {allowedTabs.includes("details") && activeTab === "details" && (
                    <BasicDetails leadData={leadData} role={role} />
                )}

                {allowedTabs.includes("assignmentHistory") && activeTab === "assignmentHistory" && (
                    <AssignmentHistory leadData={leadData} />
                )}

                {allowedTabs.includes("summary") && activeTab === "summary" && (
                    <Summary leadId={leadData?._id} />
                )}

                {allowedTabs.includes("conversationHistory") && activeTab === "conversationHistory" && (
                    <ConversationHistory leadId={leadData?._id} />
                )}

                {allowedTabs.includes("leadTimeline") && activeTab === "leadTimeline" && (
                    <LeadTimeline lead={leadData} />
                )}
            </div>

            <UpdateStatusModal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                lead={leadData}
                users={options}       // already formatted
                courses={courseOptions}
                onSuccess={fetchLead}
                hasConversation={hasConversation}
            />
        </>
    );
}

export default ViewLead;