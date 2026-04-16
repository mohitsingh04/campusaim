import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Trash2 } from "lucide-react";

import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData
} from "@tanstack/react-query";

import toast from "react-hot-toast";
import Swal from "sweetalert2";

import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import SearchFilter from "../../components/common/SearchFilter/SearchFilter";
import DataTable from "../../components/common/DataTable/DataTable";
import Pagination from "../../components/common/Pagination/Pagination";
import BulkActionsBar from "../../components/common/BulkActionsBar/BulkActionsBar";
import { ActionIconButton } from "../../components/ui/Button/ActionIconButton";

import { API } from "../../services/API";
import useDebounce from "../../utils/useDebounce";

const ITEMS_PER_PAGE = 10;

/* =========================
   API
========================= */

const fetchErrorLogs = async ({ page, search }) => {
    try {
        const { data } = await API.get("/error-logs", {
            params: {
                page,
                limit: ITEMS_PER_PAGE,
                search
            }
        });
        return data;
    } catch (error) {
        throw new Error(
            error?.response?.data?.message || "Failed to fetch error logs"
        );
    }
};

const deleteErrorLog = async (id) => {
    try {
        return await API.delete(`/error-logs/${id}`);
    } catch (error) {
        throw new Error(
            error?.response?.data?.message || "Failed to delete log"
        );
    }
};

const deleteMultipleErrorLogs = async (ids) => {
    try {
        return await API.delete("/error-logs", {
            data: { ids }
        });
    } catch (error) {
        throw new Error(
            error?.response?.data?.message || "Failed to delete logs"
        );
    }
};

const deleteAllErrorLogs = async () => {
    try {
        return await API.delete("/error-logs/all");
    } catch (error) {
        throw new Error(
            error?.response?.data?.message || "Failed to delete all logs"
        );
    }
};

export default function ErrorLogs() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    // Enforce radix 10 to prevent parsing errors
    const pageFromURL = Math.max(
        1,
        parseInt(searchParams.get("page"), 10) || 1
    );

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const prevSearchRef = useRef(debouncedSearch);
    const [selectedLogs, setSelectedLogs] = useState(new Set());

    /* =========================
       RESET PAGE ON SEARCH
    ========================== */

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

    /* =========================
       FETCH DATA
    ========================== */

    const { data, isLoading, isError } = useQuery({
        queryKey: ["errorLogs", pageFromURL, debouncedSearch],
        queryFn: () =>
            fetchErrorLogs({
                page: pageFromURL,
                search: debouncedSearch
            }),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5
    });

    const logs = data?.data || [];
    const pagination = data?.pagination || {};

    /* =========================
       DELETE
    ========================== */

    const deleteMutation = useMutation({
        mutationFn: deleteErrorLog,
        onSuccess: () => {
            toast.success("Error log deleted");
            setSelectedLogs(new Set());
            queryClient.invalidateQueries({
                queryKey: ["errorLogs"]
            });
        },
        onError: (error) => {
            toast.error(error.message || "Delete failed");
        }
    });

    const bulkDeleteMutation = useMutation({
        mutationFn: deleteMultipleErrorLogs,
        onSuccess: () => {
            toast.success("Selected logs deleted");
            setSelectedLogs(new Set());

            queryClient.invalidateQueries({
                queryKey: ["errorLogs"]
            });
        },
        onError: (error) => {
            toast.error(error.message || "Bulk delete failed");
        }
    });

    const deleteAllMutation = useMutation({
        mutationFn: deleteAllErrorLogs,
        onSuccess: () => {
            toast.success("All logs deleted");

            queryClient.invalidateQueries({
                queryKey: ["errorLogs"]
            });
        },
        onError: (error) => {
            toast.error(error.message || "Delete all failed");
        }
    });

    const confirmDelete = useCallback(async (id) => {
        const result = await Swal.fire({
            title: "Delete error log?",
            text: "This action cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            customClass: { popup: "swal2-small" }
        });

        if (!result.isConfirmed) return;
        deleteMutation.mutate(id);
    }, [deleteMutation]);

    const confirmBulkDelete = async () => {
        if (!selectedLogs.size) {
            toast.error("Please select at least one log");
            return;
        }

        const result = await Swal.fire({
            title: "Delete selected logs?",
            text: "This action cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete"
        });
        if (!result.isConfirmed) return;
        bulkDeleteMutation.mutate([...selectedLogs]);
    };

    const confirmDeleteAll = async () => {
        const result = await Swal.fire({
            title: "Delete ALL logs?",
            text: "This will remove every error log permanently",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete all"
        });
        if (!result.isConfirmed) return;
        deleteAllMutation.mutate();
    };

    /* =========================
       CSV SANITIZATION
    ========================== */

    const sanitizeCSVField = (value) => {
        const str = String(value || "");
        // Prevent CSV Injection (Excel Macro execution)
        if (/^[=\-@+]/.test(str)) return `'${str}`;
        // Escape quotes and wrap in quotes for proper CSV escaping
        return `"${str.replace(/"/g, '""')}"`;
    };

    /* =========================
       BULK ACTION
    ========================== */

    const exportSelectedRows = useCallback((rows) => {
        try {
            const headers = [
                "Message",
                "Page",
                "Role",
                "Browser",
                "Time"
            ].join(",");

            const csvRows = rows.map(row => [
                sanitizeCSVField(row.message),
                sanitizeCSVField(row.page),
                sanitizeCSVField(row.userRole),
                sanitizeCSVField(row.browser),
                sanitizeCSVField(new Date(row.createdAt).toLocaleString())
            ].join(","));

            const csvContent = [headers, ...csvRows].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "error-logs.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("Export successful");
        } catch (error) {
            console.error("[exportSelectedRows] Error:", error);
            toast.error("Export failed");
        }
    }, []);

    const handleBulkAction = useCallback((action) => {
        if (!selectedLogs.size) {
            toast.error("Please select at least one log");
            return;
        }

        const selectedRows = logs.filter(row =>
            selectedLogs.has(row._id)
        );

        switch (action) {
            case "export":
                exportSelectedRows(selectedRows);
                break;
            default:
                toast.error("Invalid action");
        }
    }, [selectedLogs, logs, exportSelectedRows]);

    /* =========================
       PAGINATION
    ========================== */

    const handlePageChange = useCallback((page) => {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            params.set("page", page.toString());
            return params;
        });
    }, [setSearchParams]);

    /* =========================
       SELECTION
    ========================== */

    const toggleSelect = useCallback((id) => {
        setSelectedLogs(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        if (!logs.length) return;

        const pageIds = logs.map(row => row._id);
        const allSelected = pageIds.every(id => selectedLogs.has(id));
        const next = new Set(selectedLogs);

        if (allSelected) {
            pageIds.forEach(id => next.delete(id));
        } else {
            pageIds.forEach(id => next.add(id));
        }

        setSelectedLogs(next);
    }, [logs, selectedLogs]);

    /* =========================
       TABLE COLUMNS
    ========================== */

    const columns = useMemo(() => [
        {
            key: "message",
            label: "Error",
            render: row => (
                <span className="text-red-600 text-sm">
                    {row.message}
                </span>
            )
        },
        {
            key: "page",
            label: "Page",
            render: row => (
                <span className="text-sm">
                    {row.page || "-"}
                </span>
            ),
        },
        {
            key: "role",
            label: "Role",
            render: row => row.userRole || "-"
        },
        {
            key: "browser",
            label: "Browser",
            render: row => (
                <span className="truncate max-w-xs block text-sm">
                    {row.browser}
                </span>
            )
        },
        {
            key: "time",
            label: "Time",
            render: row =>
                new Date(row.createdAt).toLocaleString()
        },
        {
            key: "actions",
            label: "Actions",
            render: row => (
                <div className="flex gap-2">
                    <ActionIconButton
                        label="Delete"
                        Icon={Trash2}
                        variant="danger"
                        onClick={() => confirmDelete(row._id)}
                    />
                </div>
            )
        }
    ], [confirmDelete]); // Dependency added to prevent stale closures

    if (isError) {
        return (
            <div className="p-6 text-center text-red-500">
                Failed to load error logs
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Error Logs", active: true }
                ]}
            />

            <SearchFilter
                value={searchTerm}
                onChange={setSearchTerm}
            />

            <BulkActionsBar
                selectedCount={selectedLogs.size}
                actions={[
                    { label: "Export Selected", action: "export" },
                    { label: "Delete Selected", action: "delete" },
                    { label: "Delete All Logs", action: "deleteAll" }
                ]}
                onAction={(action) => {
                    switch (action) {
                        case "export":
                            handleBulkAction("export");
                            break;
                        case "delete":
                            confirmBulkDelete();
                            break;
                        case "deleteAll":
                            confirmDeleteAll();
                            break;
                        default:
                            toast.error("Invalid action");
                    }
                }}
                onClear={() => setSelectedLogs(new Set())}
            />

            <DataTable
                columns={columns}
                data={logs}
                isLoading={isLoading}
                selectable
                rowKey={row => row._id}
                selectedRows={selectedLogs}
                onSelectRow={toggleSelect}
                onSelectAll={handleSelectAll}
                showSerial={true}
                startIndex={(pageFromURL - 1) * ITEMS_PER_PAGE}
            />

            <Pagination
                currentPage={pageFromURL}
                totalItems={pagination.total || 0}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
            />
        </div>
    );
}