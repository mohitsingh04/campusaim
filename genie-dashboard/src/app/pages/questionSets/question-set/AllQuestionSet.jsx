import React, { useEffect, useMemo, useState, useRef } from "react";
import { Eye, FileQuestion, Plus, SquarePen, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { API } from "../../../services/API";
import { useAuth } from "../../../context/AuthContext";

import Breadcrumbs from "../../../components/ui/BreadCrumb/Breadcrumbs";
import SearchFilter from "../../../components/common/SearchFilter/SearchFilter";
import BulkActionsBar from "../../../components/common/BulkActionsBar/BulkActionsBar";
import DataTable from "../../../components/common/DataTable/DataTable";
import Pagination from "../../../components/common/Pagination/Pagination";
import { ActionIconButton } from "../../../components/ui/Button/ActionIconButton";
import useDebounce from "../../../utils/useDebounce";
import StatsCards from "../../../components/common/StatsCards/StatsCards";

const ITEMS_PER_PAGE = 10;

/* =========================
   API FUNCTIONS
========================= */

const fetchQuestionSet = async ({ search }) => {
    try {
        // SECURITY: Encode URI component to prevent malformed URL requests
        const safeSearch = encodeURIComponent(search);
        const res = await API.get(`/question-set?search=${safeSearch}`);
        return res.data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || "Failed to fetch question sets");
    }
};

const deleteQuestionSet = async (ids) => {
    try {
        if (Array.isArray(ids)) {
            return await API.delete("/delete-multiple-question-set", { data: { ids } });
        }
        return await API.delete(`/delete-question-set/${ids}`);
    } catch (error) {
        throw new Error(error?.response?.data?.message || "Failed to delete question set(s)");
    }
};

export default function AllQuestionSet() {
    const navigate = useNavigate();
    const { authUser } = useAuth();
    const queryClient = useQueryClient();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Math.max(1, parseInt(searchParams.get("page")) || 1);

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const prevSearchRef = useRef(debouncedSearch);

    const [selectedQuestionSet, setSelectedQuestionSet] = useState(new Set());

    /* =========================
       RESET PAGE ON SEARCH
    ========================== */
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

    /* =========================
       FETCH DATA (TanStack)
    ========================== */
    const { data, isLoading } = useQuery({
        // Removed currentPage from queryKey; cache now depends only on search term
        queryKey: ["question-set", debouncedSearch],
        queryFn: () => fetchQuestionSet({ search: debouncedSearch }),
        enabled: !!authUser,
        keepPreviousData: true,
    });

    const allQuestionSets = data?.data || [];

    /* =========================
       CLIENT-SIDE PAGINATION
    ========================== */
    const paginatedQuestionSets = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return allQuestionSets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [allQuestionSets, currentPage]);

    /* =========================
       DELETE MUTATION
    ========================== */
    const deleteMutation = useMutation({
        mutationFn: deleteQuestionSet,
        onSuccess: () => {
            toast.success("Question Set deleted successfully");
            setSelectedQuestionSet(new Set());
            queryClient.invalidateQueries({ queryKey: ["question-set"] });
        },
        onError: (error) => toast.error(error.message || "Delete failed"),
    });

    /* =========================
       SELECTION
    ========================== */
    const toggleSelect = (id) => {
        setSelectedQuestionSet((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleSelectAll = () => {
        if (!paginatedQuestionSets.length) return;

        setSelectedQuestionSet((prev) => {
            // Only select rows visible on the current paginated slice
            const pageIds = paginatedQuestionSets.map((row) => row._id);
            const allSelected = pageIds.every((id) => prev.has(id));
            const next = new Set(prev);

            if (allSelected) pageIds.forEach((id) => next.delete(id));
            else pageIds.forEach((id) => next.add(id));

            return next;
        });
    };

    /* =========================
       PAGE CHANGE
    ========================== */
    const handlePageChange = (page) => {
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            params.set("page", page.toString());
            return params;
        });
    };

    /* =========================
       ACTIONS
    ========================== */
    const confirmDelete = async (ids) => {
        try {
            const isBulk = Array.isArray(ids);
            const result = await Swal.fire({
                title: "Are you sure?",
                text: isBulk ? `Delete ${ids.length} question set(s)?` : "This action cannot be undone",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete",
                customClass: { popup: "swal2-small" },
            });

            if (result.isConfirmed) deleteMutation.mutate(ids);
        } catch (error) {
            console.error("Confirmation UI Error:", error);
        }
    };

    const exportSelected = () => {
        try {
            if (!selectedQuestionSet.size) {
                return toast.error("Select at least one question set");
            }

            // Maps over the full dataset to allow exporting elements from multiple pages
            const dataToExport = allQuestionSets
                .filter((a) => selectedQuestionSet.has(a._id))
                .map((a) => ({
                    Order: a.order || "-",
                    Title: a.title || "-",
                    Question: a.questionText || "-",
                    Niche: a?.nicheId?.name || "-",
                    Status: a?.isActive || "-",
                }));

            const sheet = XLSX.utils.json_to_sheet(dataToExport);
            const book = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(book, sheet, "Question-Set");

            const blob = new Blob(
                [XLSX.write(book, { bookType: "xlsx", type: "array" })],
                { type: "application/octet-stream" }
            );

            saveAs(blob, "question-set.xlsx");
            toast.success("Export successful");
        } catch (error) {
            console.error("Export Error:", error);
            toast.error("Failed to export data");
        }
    };

    /* =========================
       TABLE COLUMNS
    ========================== */
    const columns = useMemo(() => [
        {
            key: "niche",
            label: "Niche",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm text-gray-900">
                        {row?.nicheId?.name || "N/A"}
                    </span>
                </div>
            ),
        },
        {
            key: "title",
            label: "Title",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm text-gray-900">
                        {row.title || "N/A"}
                    </span>
                </div>
            ),
        },
        {
            key: "options",
            label: "Options",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm text-gray-900">
                        {row?.options?.length || "N/A"}
                    </span>
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (row) => {
                const status = row?.isActive;
                const statusMap = {
                    active: "bg-green-100 text-green-700",
                    inactive: "bg-red-100 text-red-700",
                    pending: "bg-yellow-100 text-yellow-700",
                };
                const labelMap = {
                    active: "Active",
                    inactive: "Inactive",
                    pending: "Pending",
                };

                return (
                    <span className={`px-2 py-1 text-xs rounded-full font-semibold ${statusMap[status] || "bg-gray-100 text-gray-700"}`}>
                        {labelMap[status] || "Unknown"}
                    </span>
                );
            },
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex gap-2">
                    <ActionIconButton
                        label="View"
                        Icon={Eye}
                        variant="neutral"
                        onClick={() => navigate(`/dashboard/question-set/view/${row._id}`)}
                    />
                    <ActionIconButton
                        label="Edit"
                        Icon={SquarePen}
                        variant="primary"
                        onClick={() => navigate(`/dashboard/question-set/edit/${row._id}`)}
                    />
                    <ActionIconButton
                        label="Delete"
                        Icon={Trash2}
                        variant="danger"
                        onClick={() => confirmDelete(row._id)}
                    />
                </div>
            ),
        },
    ], [navigate]);

    /* =========================
       STATS
    ========================== */
    const nicheStats = useMemo(() => {
        if (!data?.stats) return [];
        return data.stats.map((item) => ({
            label: item._id,
            value: item.count,
            icon: FileQuestion,
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600",
        }));
    }, [data]);

    return (
        <div className="space-y-6">
            <Breadcrumbs
                title="Question Set"
                items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Question Set" }]}
                actions={[{ label: "Add Question Set", to: "/dashboard/question-set/add", Icon: Plus, variant: "primary" }]}
            />

            <StatsCards items={nicheStats} isLoading={isLoading} skeletonCount={4} />

            <SearchFilter value={searchTerm} onChange={setSearchTerm} />

            <BulkActionsBar
                selectedCount={selectedQuestionSet.size}
                actions={[{ label: "Export Selected", action: "export" }]}
                onAction={(a) => a === "export" ? exportSelected() : confirmDelete([...selectedQuestionSet])}
                onClear={() => setSelectedQuestionSet(new Set())}
            />

            <DataTable
                columns={columns}
                data={paginatedQuestionSets}
                isLoading={isLoading}
                selectable
                rowKey={(a) => a._id}
                selectedRows={selectedQuestionSet}
                onSelectRow={toggleSelect}
                onSelectAll={handleSelectAll}
                showSerial={true}
                startIndex={(currentPage - 1) * ITEMS_PER_PAGE}
            />

            <Pagination
                currentPage={currentPage}
                totalItems={allQuestionSets.length} // Pass the full array length to pagination
                pageSize={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
            />
        </div>
    );
}