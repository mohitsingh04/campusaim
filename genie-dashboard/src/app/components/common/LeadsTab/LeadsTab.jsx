import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { API } from "../../../services/API";
import { Eye, SquarePen, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import SearchFilter from "../SearchFilter/SearchFilter";
import BulkActionsBar from "../BulkActionsBar/BulkActionsBar";
import DataTable from "../DataTable/DataTable";
import Pagination from "../Pagination/Pagination";
import CircleProgress from "../CircleProgress/CircleProgress";

import { FeedbackData } from "../../../common/FeedbackData/FeedbackData";
import { maskEmail } from "../../../utils/maskEmail";
import useDebounce from "../../../utils/useDebounce";
import LeadStatusBadge from "../../ui/Badge/LeadStatusBadge";

const ITEMS_PER_PAGE = 10;

export default function LeadsTab({ data, userId }) {
    const navigate = useNavigate();

    const [leadsList, setLeadsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLeads, setSelectedLeads] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [leadConversations, setLeadConversations] = useState({});

    const [searchParams, setSearchParams] = useSearchParams();
    // Safely parse URL page param
    const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

    const debouncedSearch = useDebounce(searchTerm, 500);
    const prevSearchRef = useRef(debouncedSearch);

    /* ------------------------------------------------------------------ */
    /* DATA FETCH                                                         */
    /* ------------------------------------------------------------------ */

    const fetchData = useCallback(async () => {
        if (!userId) return;

        try {
            setIsLoading(true);

            const [leadRes, conversationRes] = await Promise.all([
                API.get(`/users/${userId}/leads`),
                API.get("/lead/conversation"),
            ]);

            const leadsData = leadRes?.data?.data || [];
            const conversationsArray = conversationRes?.data?.data || [];

            // Convert to hashmap for O(1) lookup
            const conversationMap = conversationsArray.reduce((acc, conv) => {
                acc[String(conv.lead_id)] = conv;
                return acc;
            }, {});

            setLeadsList(leadsData);
            setLeadConversations(conversationMap);
        } catch (error) {
            console.error("Fetch Data Error:", error);
            toast.error(error?.response?.data?.message || "Failed to load leads");
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchData();
    }, [fetchData, data?._id]);

    /* ------------------------------------------------------------------ */
    /* HELPERS                                                            */
    /* ------------------------------------------------------------------ */

    const getOverallScore = useCallback((leadId) =>
        leadConversations[String(leadId)]?.latestSession?.overallLeadScore ?? 0,
        [leadConversations]
    );

    const getFeedback = useCallback((leadId) => {
        const rating = leadConversations[String(leadId)]?.latestSession?.rating;
        return FeedbackData.find((f) => f.value === rating) || null;
    }, [leadConversations]);

    /* ------------------------------------------------------------------ */
    /* FILTERING & PAGINATION                                             */
    /* ------------------------------------------------------------------ */

    const filteredLeads = useMemo(() => {
        try {
            if (!debouncedSearch.trim()) return leadsList;

            const q = debouncedSearch.toLowerCase();
            return leadsList.filter(l =>
                l.name?.toLowerCase().includes(q) ||
                l.email?.toLowerCase().includes(q) ||
                String(l.mobile || l.contact || "").includes(q)
            );
        } catch (error) {
            console.error("Filtering Error:", error);
            return [];
        }
    }, [leadsList, debouncedSearch]);

    // Defensive pagination bounds
    const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE) || 1;
    const safePage = Math.max(1, Math.min(currentPage, totalPages));
    const startIdx = (safePage - 1) * ITEMS_PER_PAGE;

    const currentLeads = useMemo(() => {
        return filteredLeads.slice(startIdx, startIdx + ITEMS_PER_PAGE);
    }, [filteredLeads, startIdx]);

    const handlePageChange = useCallback((page) => {
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            params.set("page", page.toString());
            return params;
        });
    }, [setSearchParams]);

    useEffect(() => {
        // Enforce page reset only on explicit user search inputs
        if (prevSearchRef.current !== debouncedSearch) {
            setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                params.set("page", "1");
                return params;
            });
            prevSearchRef.current = debouncedSearch;
        }
    }, [debouncedSearch, setSearchParams]);

    useEffect(() => {
        // Auto-correct URL if current page exceeds newly filtered bounds
        if (currentPage > totalPages && filteredLeads.length > 0) {
            handlePageChange(totalPages);
        }
    }, [totalPages, currentPage, filteredLeads.length, handlePageChange]);

    /* ------------------------------------------------------------------ */
    /* SELECTION                                                          */
    /* ------------------------------------------------------------------ */

    const toggleSelect = useCallback((id) => {
        setSelectedLeads((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        if (!currentLeads.length) return;

        setSelectedLeads((prev) => {
            const pageIds = currentLeads.map((l) => l._id);
            const allSelected = pageIds.every((id) => prev.has(id));
            const next = new Set(prev);

            if (allSelected) {
                pageIds.forEach((id) => next.delete(id));
            } else {
                pageIds.forEach((id) => next.add(id));
            }

            return next;
        });
    }, [currentLeads]);

    /* ------------------------------------------------------------------ */
    /* ACTIONS                                                            */
    /* ------------------------------------------------------------------ */

    const handleDeleteLead = async (_id) => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "Yes, delete",
            });

            if (!result.isConfirmed) return;

            await API.delete(`/leads/${_id}`);
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
            });

            if (!result.isConfirmed) return;

            const toastId = toast.loading("Deleting leads...");

            await API.delete("/delete-multiple-leads", {
                data: { ids: Array.from(selectedLeads) },
            });

            toast.success("Leads deleted successfully", { id: toastId });
            setSelectedLeads(new Set());
            fetchData();
        } catch (error) {
            console.error("Bulk Delete Error:", error);
            toast.error(error?.response?.data?.error || "Bulk delete failed");
        }
    };

    const exportSelected = () => {
        try {
            if (!selectedLeads.size) {
                toast.error("Select at least one lead");
                return;
            }

            const dataToExport = leadsList
                .filter((l) => selectedLeads.has(l._id))
                .map((l) => ({
                    Name: l.name || "-",
                    Email: l.email || "-",
                    Phone: l.mobile || l.contact || "-",
                    Score: getOverallScore(l._id),
                }));

            const sheet = XLSX.utils.json_to_sheet(dataToExport);
            const book = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(book, sheet, "Leads");

            const blob = new Blob(
                [XLSX.write(book, { bookType: "xlsx", type: "array" })],
                { type: "application/octet-stream" }
            );

            saveAs(blob, "user_leads.xlsx");
            toast.success("Export successful");
        } catch (error) {
            console.error("Export Error:", error);
            toast.error("Failed to export leads");
        }
    };

    /* ------------------------------------------------------------------ */
    /* COLUMNS                                                            */
    /* ------------------------------------------------------------------ */

    const leadColumns = useMemo(
        () => [
            {
                key: "status",
                label: "Status",
                render: (lead) => {
                    const feedback = getFeedback(lead._id);
                    return <LeadStatusBadge status={lead?.status} feedback={feedback} />;
                },
            },
            {
                key: "lead",
                label: "Lead",
                render: (lead) => (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                            {lead.name || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">
                            {maskEmail(lead.email)}
                        </span>
                    </div>
                ),
            },
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
            {
                key: "actions",
                label: "Actions",
                render: (lead) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                navigate(`/dashboard/leads/view/${lead._id}?tab=details`)
                            }
                            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
                            title="View"
                        >
                            <Eye className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() =>
                                navigate(`/dashboard/leads/edit/${lead._id}`)
                            }
                            className="p-2 rounded-md hover:bg-gray-100 text-blue-600 transition-colors"
                            title="Edit"
                        >
                            <SquarePen className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => handleDeleteLead(lead._id)}
                            className="p-2 rounded-md hover:bg-red-50 text-red-600 transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [getFeedback, getOverallScore, navigate]
    );

    return (
        <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads</h3>

                <SearchFilter value={searchTerm} onChange={setSearchTerm} />

                <BulkActionsBar
                    selectedCount={selectedLeads.size}
                    actions={[
                        { label: "Export Selected", action: "export" },
                        { label: "Delete", action: "delete" },
                    ]}
                    onAction={(action) => {
                        if (action === "export") exportSelected();
                        if (action === "delete") handleBulkDelete();
                    }}
                    onClear={() => setSelectedLeads(new Set())}
                />

                <DataTable
                    columns={leadColumns}
                    data={currentLeads}
                    isLoading={isLoading}
                    selectable
                    selectedRows={selectedLeads}
                    rowKey={(l) => l._id}
                    onSelectRow={toggleSelect}
                    onSelectAll={handleSelectAll}
                />

                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredLeads.length}
                    pageSize={ITEMS_PER_PAGE}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}