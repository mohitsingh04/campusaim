import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
    Eye,
    CheckCircle,
    Users,
    Target,
    SquarePen,
    Trash2,
    Thermometer,
    Plus,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { API } from "../../services/API";
import { useAuth } from "../../context/AuthContext";
import { FeedbackData } from "../../common/FeedbackData/FeedbackData";
import { maskEmail } from "../../utils/maskEmail";

import SearchFilter from "../../components/common/SearchFilter/SearchFilter";
import BulkActionsBar from "../../components/common/BulkActionsBar/BulkActionsBar";
import DataTable from "../../components/common/DataTable/DataTable";
import Pagination from "../../components/common/Pagination/Pagination";
import StatsCards from "../../components/common/StatsCards/StatsCards";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import CircleProgress from "../../components/common/CircleProgress/CircleProgress";
import AssignLeadModal from "../../components/modal/AssignLeadModal";
import { ActionIconButton } from "../../components/ui/Button/ActionIconButton";
import useDebounce from "../../utils/useDebounce";
import LeadStatusBadge from "../../components/ui/Badge/LeadStatusBadge";

const ITEMS_PER_PAGE = 10;

export default function AllLead() {
    const navigate = useNavigate();
    const { authUser } = useAuth();
    const role = authUser?.appRole;

    // Stores the complete unpaginated dataset from the backend
    const [allLeads, setAllLeads] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLeads, setSelectedLeads] = useState(new Set());

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

    const [isLoading, setIsLoading] = useState(true);
    const [leadConversations, setLeadConversations] = useState({});
    const [showAssignModal, setShowAssignModal] = useState(false);

    const debouncedSearch = useDebounce(searchTerm, 500);
    const prevSearchRef = useRef(debouncedSearch);

    const statusFilter = searchParams.get("status");
    const assignedFilter = searchParams.get("assigned");
    const todayFilter = searchParams.get("filter");
    const followupFilter = searchParams.get("followup");

    /* ------------------------------------------------------------------ */
    /* DATA FETCH                                                         */
    /* ------------------------------------------------------------------ */
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);

            const query = new URLSearchParams();

            if (debouncedSearch) query.append("search", debouncedSearch);
            if (statusFilter) query.append("status", statusFilter);
            if (assignedFilter) query.append("assigned", assignedFilter);
            if (todayFilter) query.append("filter", todayFilter);
            if (followupFilter) query.append("followup", followupFilter);

            const [leadRes, conversationRes] = await Promise.all([
                API.get(`/leads?${query.toString()}`),
                API.get("/lead/conversation"),
            ]);

            const leadsData = leadRes?.data?.data || [];
            const conversationsArray = conversationRes?.data?.data || [];

            const conversationMap = conversationsArray.reduce((acc, conv) => {
                acc[String(conv.lead_id)] = conv;
                return acc;
            }, {});

            setAllLeads(leadsData);
            setLeadConversations(conversationMap);
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to load leads");
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, statusFilter, assignedFilter, todayFilter, followupFilter]);

    useEffect(() => {
        if (authUser?._id) fetchData();
    }, [authUser?._id, fetchData]);

    useEffect(() => {
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            params.set("page", "1");
            return params;
        });
    }, [statusFilter, assignedFilter, todayFilter, followupFilter]);

    const hasConversation = useCallback(
        (leadId) => !!leadConversations[String(leadId)]?.latestSession,
        [leadConversations]
    );

    const duplicateMap = useMemo(() => {
        const emailCount = new Map();
        const phoneCount = new Map();

        for (const lead of allLeads) {
            const email = lead?.email?.toLowerCase()?.trim();
            const phone = (lead?.mobile || lead?.contact || "").trim();

            if (email) emailCount.set(email, (emailCount.get(email) || 0) + 1);
            if (phone) phoneCount.set(phone, (phoneCount.get(phone) || 0) + 1);
        }

        const map = new Map();

        for (const lead of allLeads) {
            const email = lead?.email?.toLowerCase()?.trim();
            const phone = (lead?.mobile || lead?.contact || "").trim();

            const isDuplicate =
                (email && emailCount.get(email) > 1) ||
                (phone && phoneCount.get(phone) > 1);

            if (isDuplicate) map.set(lead._id, true);
        }

        return map;
    }, [allLeads]);

    /* ------------------------------------------------------------------ */
    /* CLIENT-SIDE PAGINATION                                             */
    /* ------------------------------------------------------------------ */

    // Derive the visible leads based on the current page slice
    const paginatedLeads = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return allLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [allLeads, currentPage]);

    useEffect(() => {
        if (prevSearchRef.current !== debouncedSearch) {
            setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                params.set("page", "1");
                return params;
            });
            prevSearchRef.current = debouncedSearch;
        }
    }, [debouncedSearch, setSearchParams]);

    const handlePageChange = useCallback(
        (page) => {
            setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                params.set("page", page.toString());
                return params;
            });
        },
        [setSearchParams]
    );

    useEffect(() => {
        const totalPages = Math.ceil(allLeads.length / ITEMS_PER_PAGE) || 1;
        if (currentPage > totalPages && allLeads.length > 0) {
            handlePageChange(totalPages);
        }
    }, [allLeads.length, currentPage, handlePageChange]);

    /* ------------------------------------------------------------------ */
    /* HELPERS                                                            */
    /* ------------------------------------------------------------------ */
    const getOverallScore = useCallback(
        (leadId) => leadConversations[String(leadId)]?.latestSession?.overallLeadScore ?? 0,
        [leadConversations]
    );

    const getFeedback = useCallback(
        (leadId) => {
            const rating = leadConversations[String(leadId)]?.latestSession?.rating;
            return FeedbackData.find((f) => f.value === rating) || null;
        },
        [leadConversations]
    );

    /* =========================
       SELECTION
    ========================== */
    const canBulkSelect = useMemo(() => role === "admin" || role === "teamleader", [role]);

    const toggleSelect = useCallback(
        (id) => {
            if (!canBulkSelect) return;
            setSelectedLeads((prev) => {
                const next = new Set(prev);
                next.has(id) ? next.delete(id) : next.add(id);
                return next;
            });
        },
        [canBulkSelect]
    );

    const handleSelectAll = useCallback(() => {
        if (!canBulkSelect || !paginatedLeads.length) return;

        setSelectedLeads((prev) => {
            const pageIds = paginatedLeads.map((row) => row._id);
            const allSelected = pageIds.every((id) => prev.has(id));
            const next = new Set(prev);

            if (allSelected) pageIds.forEach((id) => next.delete(id));
            else pageIds.forEach((id) => next.add(id));

            return next;
        });
    }, [canBulkSelect, paginatedLeads]);

    /* ------------------------------------------------------------------ */
    /* ACTIONS                                                            */
    /* ------------------------------------------------------------------ */
    const handleDeleteLead = async (id) => {
        try {
            const res = await Swal.fire({
                title: "Delete lead?",
                text: "This action cannot be undone",
                icon: "warning",
                showCancelButton: true,
            });

            if (!res.isConfirmed) return;

            await API.delete(`/leads/${id}`);
            toast.success("Lead deleted");
            fetchData();
        } catch (error) {
            console.error("Delete Error:", error);
            toast.error(error?.response?.data?.message || "Delete failed");
        }
    };

    const handleBulkDelete = async () => {
        try {
            if (!selectedLeads.size) return toast.error("No leads selected");

            const result = await Swal.fire({
                title: "Delete selected leads?",
                text: `You are about to delete ${selectedLeads.size} lead(s). This action cannot be undone.`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "Yes, delete",
                reverseButtons: true,
                focusCancel: true,
            });

            if (!result.isConfirmed) return;

            const toastId = toast.loading("Deleting selected leads...");

            await API.delete("/delete-multiple-leads", {
                data: { ids: Array.from(selectedLeads) },
            });

            toast.success("Leads deleted successfully", { id: toastId });
            setSelectedLeads(new Set());
            fetchData();
        } catch (error) {
            console.error("Bulk delete error:", error);
            toast.error(error?.response?.data?.error || "Bulk delete failed");
        }
    };

    const exportSelected = () => {
        try {
            if (!selectedLeads.size) return toast.error("No leads selected");

            const data = allLeads
                .filter((l) => selectedLeads.has(l._id))
                .map((l) => ({
                    Name: l.name || "-",
                    Email: l.email || "-",
                    Phone: l.mobile || l.contact || "-",
                    City: l.city || "-",
                }));

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Leads");

            const blob = new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], {
                type: "application/octet-stream",
            });

            saveAs(blob, "leads.xlsx");
            toast.success("Export successful");
        } catch (error) {
            console.error("Export Error:", error);
            toast.error("Failed to export leads");
        }
    };

    const canEditLead = ["admin", "counselor"].includes(role);

    /* ------------------------------------------------------------------ */
    /* COLUMNS                                                            */
    /* ------------------------------------------------------------------ */
    const leadColumns = useMemo(() => {
        const cols = [
            {
                key: "status",
                label: "Status",
                render: (lead) => {
                    const feedback = getFeedback(lead._id);
                    return <LeadStatusBadge status={lead?.status} feedback={feedback} />;
                },
            },

            // 🔥 Lead (Primary Info + Duplicate Highlight)
            {
                key: "lead",
                label: "Lead",
                render: (lead) => {
                    const isDuplicate = duplicateMap.get(lead._id);

                    return (
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-900">
                                    {lead.name || "N/A"}
                                </span>

                                {isDuplicate && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white font-semibold">
                                        Duplicate
                                    </span>
                                )}
                            </div>

                            <span className="text-xs text-gray-400">
                                {maskEmail(lead.email)}
                            </span>
                        </div>
                    );
                },
            },

            // 🔥 Score moved next to Lead (decision-first UX)
            {
                key: "score",
                label: "Lead Score",
                render: (lead) => (
                    <CircleProgress
                        value={Math.round(getOverallScore(lead._id))}
                        size={42}
                        stroke={4}
                    />
                ),
            },
        ];

        // 🔐 Assignment (Context)
        if (role === "admin") {
            cols.push({
                key: "assignedTo",
                label: "Assigned To",
                render: (lead) => {
                    const assignee = lead?.assignedTo;

                    if (!assignee) {
                        return (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                                Unassigned
                            </span>
                        );
                    }

                    return (
                        <div className="flex flex-col">
                            <span className="font-medium text-sm text-gray-900">
                                {assignee?.name || "N/A"}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                                {assignee?.role?.role || "user"}
                            </span>
                        </div>
                    );
                },
            });
        }

        if (role === "counselor") {
            cols.push({
                key: "assignedLead",
                label: "Assignment",
                render: (lead) => {
                    const userId = String(authUser?._id);

                    const isCreatedByMe =
                        String(lead?.createdBy?._id) === userId;

                    const isAssignedToMe =
                        String(lead?.assignedTo?._id) === userId;

                    // 🔥 PRIORITY: createdBy > assignedTo
                    if (isCreatedByMe) {
                        return (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                Added by You
                            </span>
                        );
                    }

                    if (isAssignedToMe) {
                        return (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                Assigned to You
                            </span>
                        );
                    }

                    return null;
                },
            });
        }

        // 🧾 Added By (Secondary info)
        if (role === "admin" || role === "teamleader") {
            cols.push({
                key: "addedBy",
                label: "Added By",
                render: (lead) => {
                    const user = lead?.createdBy;

                    return (
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-medium text-gray-900">
                                {user?.name || "System"}
                            </span>
                            {role === "admin" && (
                                <span className="text-xs text-gray-500 truncate max-w-[140px]">
                                    {user?.email || "organic@lead"}
                                </span>
                            )}
                        </div>
                    );
                },
            });
        }

        // ⚡ Actions
        cols.push({
            key: "actions",
            label: "Actions",
            render: (lead) => (
                <div className="flex items-center gap-2">
                    <ActionIconButton
                        label="View"
                        Icon={Eye}
                        variant="neutral"
                        onClick={() =>
                            navigate(`/dashboard/leads/view/${lead._id}?tab=details`)
                        }
                    />

                    {canEditLead && (
                        <ActionIconButton
                            label="Edit"
                            Icon={SquarePen}
                            variant="primary"
                            onClick={() =>
                                navigate(`/dashboard/leads/edit/${lead._id}`)
                            }
                        />
                    )}

                    {role === "admin" && (
                        <ActionIconButton
                            label="Delete"
                            Icon={Trash2}
                            variant="danger"
                            onClick={() => handleDeleteLead(lead._id)}
                        />
                    )}
                </div>
            ),
        });

        return cols;
    }, [
        role,
        authUser?._id,
        getFeedback,
        getOverallScore,
        navigate,
        duplicateMap, // 🔥 IMPORTANT
    ]);

    /* ------------------------------------------------------------------ */
    /* STATS (Calculated on the full dataset, not just the current page)  */
    /* ------------------------------------------------------------------ */
    const highChanceCount = useMemo(
        () =>
            allLeads.filter(
                (l) => hasConversation(l._id) && getOverallScore(l._id) >= 70
            ).length,
        [allLeads, getOverallScore, hasConversation]
    );

    const mediumChanceCount = useMemo(
        () =>
            allLeads.filter((l) => {
                if (!hasConversation(l._id)) return false;
                const s = getOverallScore(l._id);
                return s >= 40 && s < 70;
            }).length,
        [allLeads, getOverallScore, hasConversation]
    );

    const lowChanceCount = useMemo(
        () =>
            allLeads.filter(
                (l) => hasConversation(l._id) && getOverallScore(l._id) < 40
            ).length,
        [allLeads, getOverallScore, hasConversation]
    );

    const notEvaluatedCount = useMemo(
        () => allLeads.filter((l) => !hasConversation(l._id)).length,
        [allLeads, hasConversation]
    );

    const statsData = [
        {
            label: "Total Leads",
            value: allLeads.length,
            icon: Users,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            label: "High Admission Chance",
            value: highChanceCount,
            icon: Target,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
        },
        {
            label: "Medium Chance",
            value: mediumChanceCount,
            icon: Thermometer,
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600",
        },
        {
            label: "Low Chance",
            value: lowChanceCount,
            icon: CheckCircle,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
        },
        {
            label: "Not Evaluated",
            value: notEvaluatedCount,
            icon: Users,
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600",
        },
    ];

    const actions = useMemo(() => {
        if (!role) return null;

        const baseActions = [
            { label: "Add Lead", to: "/dashboard/leads/add", Icon: Plus, variant: "primary" },
        ];

        if (role === "admin") {
            return [
                ...baseActions,
                { label: "Add Bulk Leads", to: "/dashboard/leads/add/bulk", Icon: Plus, variant: "primary" },
            ];
        }

        if (role === "counselor" || role === "teamleader") return baseActions;
        return null;
    }, [role]);

    const bulkActions = useMemo(() => {
        if (!role) return [];
        switch (role) {
            case "admin":
                return [
                    { label: "Export Selected", action: "export" },
                    { label: "Assign Lead", action: "assign" },
                    { label: "Delete", action: "delete" },
                ];
            case "teamleader":
                return [{ label: "Assign Lead", action: "assign" }];
            default:
                return [];
        }
    }, [role]);

    return (
        <>
            <div className="space-y-6">
                <Breadcrumbs
                    items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Leads" }]}
                    actions={actions}
                />

                <StatsCards items={statsData} isLoading={isLoading} skeletonCount={5} />

                <SearchFilter value={searchTerm} onChange={setSearchTerm} />

                {bulkActions.length > 0 && (
                    <BulkActionsBar
                        selectedCount={selectedLeads.size}
                        actions={bulkActions}
                        onAction={(action) => {
                            try {
                                if (action === "export") exportSelected();
                                if (action === "delete") handleBulkDelete();
                                if (action === "assign") setShowAssignModal(true);
                            } catch (err) {
                                console.error("Bulk action failed:", err);
                                toast.error("Action failed");
                            }
                        }}
                        onClear={() => setSelectedLeads(new Set())}
                    />
                )}

                {(statusFilter || assignedFilter || todayFilter || followupFilter) && (
                    <div className="flex flex-wrap gap-2 bg-gray-50 p-3 rounded-lg border">
                        {statusFilter && <span className="text-xs bg-blue-100 px-2 py-1 rounded">Status: {statusFilter}</span>}
                        {assignedFilter === "false" && <span className="text-xs bg-yellow-100 px-2 py-1 rounded">Unassigned</span>}
                        {todayFilter && <span className="text-xs bg-green-100 px-2 py-1 rounded">Today Leads</span>}
                        {followupFilter && <span className="text-xs bg-purple-100 px-2 py-1 rounded">Follow-ups Today</span>}

                        <button
                            onClick={() => navigate("/dashboard/leads/all")}
                            className="text-xs text-red-500 ml-auto"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                <DataTable
                    columns={leadColumns}
                    data={paginatedLeads}
                    isLoading={isLoading}
                    selectable={canBulkSelect}
                    selectedRows={selectedLeads}
                    rowKey={(l) => l._id}
                    onSelectRow={toggleSelect}
                    onSelectAll={handleSelectAll}
                    showSerial={true}
                    startIndex={(currentPage - 1) * ITEMS_PER_PAGE} // ✅ FIXED
                />

                <Pagination
                    totalItems={allLeads.length}
                    currentPage={currentPage}
                    pageSize={ITEMS_PER_PAGE}
                    onPageChange={handlePageChange}
                />
            </div>

            {showAssignModal && (
                <AssignLeadModal
                    leadIds={[...selectedLeads]}
                    currentLead={paginatedLeads.find((l) => selectedLeads.has(l._id))}
                    onClose={() => setShowAssignModal(false)}
                    onAssigned={() => {
                        setSelectedLeads(new Set());
                        fetchData();
                    }}
                />
            )}
        </>
    );
}