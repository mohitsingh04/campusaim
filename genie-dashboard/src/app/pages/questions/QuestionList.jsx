import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { CheckCircle2, Clock3, Eye, Layers, Plus, SquarePen, Trash2, XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import SearchFilter from "../../components/common/SearchFilter/SearchFilter";
import BulkActionsBar from "../../components/common/BulkActionsBar/BulkActionsBar";
import DataTable from "../../components/common/DataTable/DataTable";
import Pagination from "../../components/common/Pagination/Pagination";
import StatsCards from "../../components/common/StatsCards/StatsCards";
import { ActionIconButton } from "../../components/ui/Button/ActionIconButton";

import { API } from "../../services/API";
import { useAuth } from "../../context/AuthContext";
import useDebounce from "../../utils/useDebounce";

const ITEMS_PER_PAGE = 10;

/* =============================
   API FETCH (NO PAGINATION)
============================= */
const fetchQuestions = async ({ nicheId }) => {
    try {
        const res = await API.get(`/questions/niche/${nicheId}`);
        return res.data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || "Failed to fetch");
    }
};

export default function QuestionList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { authUser } = useAuth();
    const nicheId = authUser?.nicheId;

    const [searchTerm, setSearchTerm] = useState("");
    const [selected, setSelected] = useState(new Set());

    const debouncedSearch = useDebounce(searchTerm, 500);

    /* =============================
       URL PAGINATION
    ============================= */
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

    const handlePageChange = useCallback((page) => {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            params.set("page", page.toString());
            return params;
        });
    }, [setSearchParams]);

    /* =============================
       FETCH DATA
    ============================= */
    const { data, isLoading } = useQuery({
        queryKey: ["questions", nicheId],
        queryFn: () => fetchQuestions({ nicheId }),
        enabled: !!nicheId,
        staleTime: 1000 * 60 * 5
    });

    const allQuestions = useMemo(() => data?.data || [], [data]);

    /* =============================
       SEARCH FILTER
    ============================= */
    const filteredQuestions = useMemo(() => {
        try {
            if (!debouncedSearch.trim()) return allQuestions;

            const q = debouncedSearch.toLowerCase();

            return allQuestions.filter(item => {
                const title = item.title?.toLowerCase() || "";
                const question = item.questionText?.toLowerCase() || "";
                const status = item.status?.toLowerCase() || "";

                return title.includes(q) || question.includes(q) || status.includes(q);
            });
        } catch (err) {
            console.error("Filter error:", err);
            return [];
        }
    }, [allQuestions, debouncedSearch]);

    /* =============================
       SAFE PAGINATION
    ============================= */
    const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE) || 1;
    const safePage = Math.max(1, Math.min(currentPage, totalPages));
    const startIdx = (safePage - 1) * ITEMS_PER_PAGE;

    const paginatedQuestions = useMemo(() => {
        try {
            return filteredQuestions.slice(startIdx, startIdx + ITEMS_PER_PAGE);
        } catch (err) {
            console.error("Pagination error:", err);
            return [];
        }
    }, [filteredQuestions, startIdx]);

    /* =============================
       RESET PAGE ON SEARCH
    ============================= */
    const prevSearchRef = useRef(debouncedSearch);

    useEffect(() => {
        if (prevSearchRef.current !== debouncedSearch) {
            setSearchParams(prev => {
                const params = new URLSearchParams(prev);
                params.set("page", "1");
                return params;
            });
            prevSearchRef.current = debouncedSearch;
        }
    }, [debouncedSearch, setSearchParams]);

    /* =============================
       AUTO FIX INVALID PAGE
    ============================= */
    useEffect(() => {
        if (currentPage > totalPages && filteredQuestions.length > 0) {
            handlePageChange(totalPages);
        }
    }, [currentPage, totalPages, filteredQuestions.length, handlePageChange]);

    /* =============================
       SELECTION
    ============================= */
    const toggleSelect = useCallback((id) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        if (!paginatedQuestions.length) return;

        setSelected(prev => {
            const pageIds = paginatedQuestions.map(q => q._id);
            const allSelected = pageIds.every(id => prev.has(id));
            const next = new Set(prev);

            if (allSelected) pageIds.forEach(id => next.delete(id));
            else pageIds.forEach(id => next.add(id));

            return next;
        });
    }, [paginatedQuestions]);

    const clearSelection = () => setSelected(new Set());

    /* =============================
       DELETE
    ============================= */
    const handleDeleteQuestion = async (id) => {
        try {
            const result = await Swal.fire({
                title: "Delete Question?",
                text: "This cannot be undone",
                icon: "warning",
                showCancelButton: true
            });

            if (!result.isConfirmed) return;

            await API.delete(`/delete-questions/${id}`);
            toast.success("Deleted");

            queryClient.invalidateQueries({
                queryKey: ["questions", nicheId]
            });

        } catch {
            toast.error("Delete failed");
        }
    };

    const handleBulkDelete = async () => {
        if (!selected.size) return toast.error("No selection");

        try {
            const result = await Swal.fire({
                title: "Delete selected?",
                text: `${selected.size} items`,
                icon: "warning",
                showCancelButton: true
            });

            if (!result.isConfirmed) return;

            await API.delete("/delete-multiple-questions", {
                data: { ids: Array.from(selected) }
            });

            toast.success("Deleted");
            setSelected(new Set());

            queryClient.invalidateQueries({
                queryKey: ["questions", nicheId]
            });

        } catch {
            toast.error("Failed");
        }
    };

    /* =============================
       EXPORT
    ============================= */
    const exportSelected = () => {
        if (!selected.size) return toast.error("Select items");

        const rows = allQuestions
            .filter(q => selected.has(q._id))
            .map(q => ({
                Title: q.title || "-",
                Question: q.questionText || "-",
                Status: q.status || "-"
            }));

        const sheet = XLSX.utils.json_to_sheet(rows);
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, sheet, "Questions");

        const blob = new Blob(
            [XLSX.write(book, { bookType: "xlsx", type: "array" })],
            { type: "application/octet-stream" }
        );

        saveAs(blob, "questions.xlsx");
        toast.success("Exported");
    };

    /* =============================
       STATS
    ============================= */
    const statsData = useMemo(() => {
        let active = 0, inactive = 0, pending = 0;

        for (const q of filteredQuestions) {
            if (q.status === "active") active++;
            else if (q.status === "inactive") inactive++;
            else if (q.status === "pending") pending++;
        }

        return [
            { label: "Total Questions", value: filteredQuestions.length, icon: Layers, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
            { label: "Active", value: active, icon: CheckCircle2, iconBg: "bg-green-100", iconColor: "text-green-600" },
            { label: "Inactive", value: inactive, icon: XCircle, iconBg: "bg-red-100", iconColor: "text-red-600" },
            { label: "Pending", value: pending, icon: Clock3, iconBg: "bg-yellow-100", iconColor: "text-yellow-600" }
        ];
    }, [filteredQuestions]);

    /* =============================
       COLUMNS
    ============================= */
    const columns = useMemo(() => [
        { key: "title", label: "Title", render: (q) => <span className="font-medium text-sm">{q.title || "N/A"}</span> },
        { key: "question", label: "Question", render: (q) => <span className="text-sm">{q.questionText || "N/A"}</span> },
        {
            key: "status",
            label: "Status",
            render: (q) => {
                const map = {
                    active: "bg-green-100 text-green-700",
                    inactive: "bg-red-100 text-red-700",
                    pending: "bg-yellow-100 text-yellow-700"
                };
                return <span className={`px-2 py-1 text-xs rounded ${map[q.status] || ""}`}>{q.status}</span>;
            }
        },
        {
            key: "actions",
            label: "Actions",
            render: (q) => (
                <div className="flex gap-2">
                    <ActionIconButton label="View" Icon={Eye} variant="neutral" onClick={() => navigate(`/dashboard/questions/view/${q._id}`)} />
                    <ActionIconButton label="Edit" Icon={SquarePen} variant="primary" onClick={() => navigate(`/dashboard/questions/edit/${q._id}`)} />
                    <ActionIconButton label="Delete" Icon={Trash2} variant="danger" onClick={() => handleDeleteQuestion(q._id)} />
                </div>
            )
        }
    ], [navigate]);

    if (!nicheId) {
        return <p>Add Niche first.</p>
    }

    return (
        <div className="space-y-6">
            <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Questions" }]} actions={[{ label: "Add Questions", to: "/dashboard/questions/add", Icon: Plus }]} />

            <StatsCards items={statsData} isLoading={isLoading} />

            <SearchFilter value={searchTerm} onChange={setSearchTerm} />

            <BulkActionsBar
                selectedCount={selected.size}
                actions={[{ label: "Export Selected", action: "export" }, { label: "Delete", action: "delete" }]}
                onAction={(a) => a === "export" ? exportSelected() : handleBulkDelete()}
                onClear={clearSelection}
            />

            <DataTable
                columns={columns}
                data={paginatedQuestions}
                isLoading={isLoading}
                selectable
                rowKey={(row) => row._id}
                selectedRows={selected}
                onSelectRow={toggleSelect}
                onSelectAll={handleSelectAll}
                showSerial
                startIndex={(safePage - 1) * ITEMS_PER_PAGE}
            />

            <Pagination
                currentPage={safePage}
                totalItems={filteredQuestions.length}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
            />
        </div>
    );
}