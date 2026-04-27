import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    CheckCircle2,
    Clock3,
    Eye,
    Layers,
    Plus,
    SquarePen,
    Trash2,
    XCircle,
} from "lucide-react";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import SearchFilter from "../../components/common/SearchFilter/SearchFilter";
import DataTable from "../../components/common/DataTable/DataTable";
import Pagination from "../../components/common/Pagination/Pagination";
import BulkActionsBar from "../../components/common/BulkActionsBar/BulkActionsBar";
import StatsCards from "../../components/common/StatsCards/StatsCards";
import { ActionIconButton } from "../../components/ui/Button/ActionIconButton";

import { API } from "../../services/API";
import useDebounce from "../../utils/useDebounce";

const ITEMS_PER_PAGE = 10;

/* =========================
   API (INLINE — NOT SEPARATE)
========================= */

const fetchNiche = async ({ page, search }) => {
    try {
        const { data } = await API.get("/niche", {
            params: {
                page,
                limit: ITEMS_PER_PAGE,
                search,
            },
        });
        return data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || "Failed to fetch niche data");
    }
};

const deleteNiche = async (id) => {
    try {
        return await API.delete(`/niche/${id}`);
    } catch (error) {
        throw new Error(error?.response?.data?.message || "Failed to delete niche");
    }
};

export default function AllNiche() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [searchParams, setSearchParams] = useSearchParams();

    // Enforce a minimum of 1 to prevent ?page=0 or NaN errors
    const pageFromURL = Math.max(1, parseInt(searchParams.get("page")) || 1);

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Track previous search to prevent erroneous URL overwrites on mount
    const prevSearchRef = useRef(debouncedSearch);

    const [selectedNiche, setSelectedNiche] = useState(new Set());

    /* =========================
       RESET PAGE ON SEARCH
    ========================== */

    useEffect(() => {
        // Only trigger a page reset if the search query explicitly changes.
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
       FETCH DATA
    ========================== */

    const { data, isLoading, isError } = useQuery({
        queryKey: ["niche", pageFromURL, debouncedSearch],

        queryFn: () =>
            fetchNiche({
                page: pageFromURL,
                search: debouncedSearch,
            }),
        // Assumption: React Query v5 based on keepPreviousData import
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5,
    });

    const niche = data?.data || [];
    const pagination = data?.pagination || {};

    /* =========================
       DELETE
    ========================== */

    const deleteMutation = useMutation({
        mutationFn: deleteNiche,

        onSuccess: () => {
            toast.success("Niche deleted successfully");
            setSelectedNiche(new Set()); // Clear selection on successful delete

            queryClient.invalidateQueries({
                queryKey: ["niche"],
            });
        },

        onError: (error) => {
            toast.error(error.message || "Delete failed");
        },
    });

    const handleBulkAction = (action) => {
        if (!selectedNiche.size) {
            toast.error("Please select at least one niche");
            return;
        }

        const selectedRows = niche.filter((row) =>
            selectedNiche.has(row._id)
        );

        switch (action) {
            case "export":
                exportSelectedRows(selectedRows);
                break;

            default:
                toast.error("Invalid action");
        }
    };

    const exportSelectedRows = (rows) => {
        try {
            const headers = ["Name", "Status"];

            const csvRows = rows.map((row) => [
                row.name || "",
                row.status || "",
            ]);

            const csvContent =
                [headers, ...csvRows]
                    .map((e) => e.join(","))
                    .join("\n");

            const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
            });

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "niche-export.csv";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the object URL to prevent memory leaks
            URL.revokeObjectURL(url);

            toast.success("Export successful");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Export failed");
        }
    };

    /* =========================
       PAGE CHANGE
    ========================== */

    const handlePageChange = (page) => {
        // Use functional state update to preserve any other URL parameters
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            params.set("page", page.toString());
            return params;
        });
    };

    /* =========================
       SELECTION
    ========================== */

    const toggleSelect = (id) => {
        setSelectedNiche((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleSelectAll = () => {
        if (!niche.length) return;

        const pageIds = niche.map((row) => row._id);
        const allSelected = pageIds.every((id) => selectedNiche.has(id));
        const next = new Set(selectedNiche);

        if (allSelected) pageIds.forEach((id) => next.delete(id));
        else pageIds.forEach((id) => next.add(id));

        setSelectedNiche(next);
    };

    /* =========================
       DELETE CONFIRM
    ========================== */

    const confirmDelete = async (id) => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "This action cannot be undone",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete",
                customClass: { popup: "swal2-small" },
            });

            if (!result.isConfirmed) return;

            deleteMutation.mutate(id);
        } catch (error) {
            console.error("Delete confirmation error:", error);
        }
    };

    /* =========================
       TABLE COLUMNS
    ========================== */

    const columns = useMemo(
        () => [
            {
                key: "name",
                label: "Niche",
                render: (row) => <span>{row.name}</span>,
            },
            {
                key: "status",
                label: "Status",
                render: (row) => {
                    const STATUS_MAP = {
                        active: "bg-green-100 text-green-700",
                        inactive: "bg-red-100 text-red-700",
                        pending: "bg-yellow-100 text-yellow-700",
                    };

                    const status = row.status || "inactive";

                    return (
                        <span
                            className={`px-2 py-1 text-xs rounded-full font-semibold capitalize ${STATUS_MAP[status] || "bg-gray-100 text-gray-700"
                                }`}
                        >
                            {status}
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
                            onClick={() =>
                                navigate(`/dashboard/niche/view/${row.slug}`)
                            }
                        />

                        <ActionIconButton
                            label="Edit"
                            Icon={SquarePen}
                            variant="primary"
                            onClick={() =>
                                navigate(`/dashboard/niche/edit/${row.slug}`)
                            }
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
        ],
        [navigate]
    );

    /* =========================
       STATS
    ========================== */

    const statsData = useMemo(() => {
        let active = 0;
        let inactive = 0;
        let pending = 0;

        niche.forEach((item) => {
            if (item.status === "active") active++;
            else if (item.status === "inactive") inactive++;
            else if (item.status === "pending") pending++;
        });

        return [
            {
                label: "Total Niche",
                value: pagination.total || 0,
                icon: Layers,
                iconBg: "bg-blue-100",
                iconColor: "text-blue-600",
            },
            {
                label: "Active Niche",
                value: active,
                icon: CheckCircle2,
                iconBg: "bg-green-100",
                iconColor: "text-green-600",
            },
            {
                label: "Inactive Niche",
                value: inactive,
                icon: XCircle,
                iconBg: "bg-red-100",
                iconColor: "text-red-600",
            },
            {
                label: "Pending Niche",
                value: pending,
                icon: Clock3,
                iconBg: "bg-yellow-100",
                iconColor: "text-yellow-600",
            },
        ];
    }, [niche, pagination.total]);

    if (isError) {
        return (
            <div className="p-6 text-center text-red-500">
                Failed to load niche data
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Niche", active: true },
                ]}
                actions={[
                    {
                        label: "Add Niche",
                        to: "/dashboard/niche/add",
                        Icon: Plus,
                        variant: "primary",
                    },
                ]}
            />

            <StatsCards items={statsData} isLoading={isLoading} skeletonCount={4} />

            <SearchFilter value={searchTerm} onChange={setSearchTerm} />

            <BulkActionsBar
                selectedCount={selectedNiche.size}
                actions={[
                    { label: "Export Selected", action: "export" },
                ]}
                onAction={handleBulkAction}
                onClear={() => setSelectedNiche(new Set())}
            />

            <DataTable
                columns={columns}
                data={niche}
                isLoading={isLoading}
                selectable
                rowKey={(row) => row._id}
                selectedRows={selectedNiche}
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