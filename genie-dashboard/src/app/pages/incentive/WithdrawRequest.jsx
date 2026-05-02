import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import { API } from "../../services/API";
import DataTable from "../../components/common/DataTable/DataTable";
import { Eye, Layers } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ActionIconButton } from "../../components/ui/Button/ActionIconButton";
import BulkActionsBar from "../../components/common/BulkActionsBar/BulkActionsBar";
import useDebounce from "../../utils/useDebounce";
import SearchFilter from "../../components/common/SearchFilter/SearchFilter";
import Pagination from "../../components/common/Pagination/Pagination";
import toast from "react-hot-toast";
import StatsCards from "../../components/common/StatsCards/StatsCards";
import { maskEmail } from "../../utils/maskEmail";
import { maskPhone } from "../../utils/maskPhone";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE = 10;

// ✅ centralized status config
const STATUS_CONFIG = {
    earned: {
        label: "Available",
        className: "bg-yellow-100 text-yellow-700"
    },
    processing: {
        label: "Processing",
        className: "bg-orange-100 text-orange-700"
    },
    paid: {
        label: "Paid",
        className: "bg-green-100 text-green-700"
    },
    rejected: {
        label: "Rejected",
        className: "bg-red-100 text-red-700"
    },
    approved: {
        label: "Approved",
        className: "bg-green-100 text-green-700"
    },
};

export default function WithdrawRequest() {
    const navigate = useNavigate();
    const [request, setRequest] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(new Set());
    const [searchParams, setSearchParams] = useSearchParams();

    const pageFromURL = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const prevSearchRef = useRef(debouncedSearch);

    /* ---------- reset page on search ---------- */
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

    /* ---------- Fetch Data ---------- */
    const fetchWithdrawRequest = async () => {
        try {
            setIsLoading(true);
            const { data } = await API.get("/withdraw-request");
            setRequest(data?.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch withdraw request");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawRequest();
    }, []);

    // ✅ search filter
    const filteredData = useMemo(() => {
        if (!debouncedSearch) return request;

        const term = debouncedSearch.toLowerCase();
        return request.filter(row =>
            row?.earnings?.[0]?.leadId?.name?.toLowerCase().includes(term) ||
            row?.earnings?.[0]?.leadId?.email?.toLowerCase().includes(term)
        );
    }, [request, debouncedSearch]);

    // ✅ pagination
    const totalItems = filteredData.length;

    const paginatedData = useMemo(() => {
        const start = (pageFromURL - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredData, pageFromURL]);

    const handlePageChange = useCallback((page) => {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            params.set("page", page.toString());
            return params;
        });
    }, [setSearchParams]);

    // ✅ selection
    const toggleSelect = useCallback((id) => {
        setSelectedRequest(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        if (!paginatedData.length) return;

        const pageIds = paginatedData.map(row => row._id);
        const allSelected = pageIds.every(id => selectedRequest.has(id));
        const next = new Set(selectedRequest);

        if (allSelected) pageIds.forEach(id => next.delete(id));
        else pageIds.forEach(id => next.add(id));

        setSelectedRequest(next);
    }, [paginatedData, selectedRequest]);

    // ✅ export
    const exportSelectedRows = useCallback((rows) => {
        try {
            const headers = ["Lead", "Contact", "Amount", "Status"].join(",");

            const csvRows = rows.map(row => [
                `"${row?.earnings?.[0]?.leadId?.name || ""}"`,
                `"${row?.earnings?.[0]?.leadId?.contact || ""}"`,
                `"${row?.totalAmount || 0}"`,
                `"${row?.status || ""}"`
            ].join(","));

            const blob = new Blob([[headers, ...csvRows].join("\n")], {
                type: "text/csv;charset=utf-8;"
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "withdraw-request.csv";
            link.click();

            URL.revokeObjectURL(url);
            toast.success("Export successful");
        } catch (error) {
            console.error(error);
            toast.error("Export failed");
        }
    }, []);

    const handleBulkAction = useCallback(() => {
        if (!selectedRequest.size) {
            toast.error("Select at least one row");
            return;
        }

        const selectedRows = request.filter(row =>
            selectedRequest.has(row._id)
        );

        exportSelectedRows(selectedRows);
    }, [selectedRequest, request, exportSelectedRows]);

    const handleApprove = async (id) => {
        try {
            // ✅ Confirm Modal
            const result = await Swal.fire({
                title: "Approve Withdrawal?",
                text: "This action will mark the request as paid.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#16a34a",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, Approve",
                cancelButtonText: "Cancel"
            });

            if (!result.isConfirmed) return;

            // ✅ Loading State
            Swal.fire({
                title: "Processing...",
                text: "Approving withdraw request",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const { data } = await API.patch(`/withdraw-request/${id}/approve`);

            Swal.close();

            if (data.success) {
                await Swal.fire({
                    title: "Approved",
                    text: data.message || "Withdraw approved successfully",
                    icon: "success",
                    confirmButtonColor: "#16a34a"
                });

                fetchWithdrawRequest(); // refresh
            }

        } catch (err) {
            Swal.close();

            Swal.fire({
                title: "Error",
                text: err?.response?.data?.error || "Approval failed",
                icon: "error",
                confirmButtonColor: "#dc2626"
            });
        }
    };

    const handleReject = async (id) => {
        const { value: reason } = await Swal.fire({
            title: "Reject Reason",
            input: "text",
            inputPlaceholder: "Enter reason...",
            showCancelButton: true
        });

        if (!reason) return;

        try {
            await API.patch(`/withdraw-request/${id}/reject`, { reason });
            toast.success("Rejected");
            fetchWithdrawRequest();
        } catch {
            toast.error("Failed");
        }
    };

    // ✅ table columns
    const columns = useMemo(() => [
        {
            key: "lead",
            label: "Lead",
            render: (row) => {
                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-gray-900">
                                {row?.earnings?.[0]?.leadId?.name || "-"}
                            </span>
                        </div>

                        <span className="text-xs text-gray-400">
                            {/* {maskEmail(row?.earnings?.[0]?.leadId?.email || "-")} */}
                            {row?.earnings?.[0]?.leadId?.email || "-"}
                        </span>

                        <span className="text-xs text-gray-400">
                            {row?.earnings?.[0]?.leadId?.contact || "-"}
                        </span>
                    </div>
                );
            },
        },
        {
            key: "counselor",
            label: "Counselor",
            render: (row) => {
                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-gray-900">
                                {row?.user?.name || "-"}
                            </span>
                        </div>

                        <span className="text-xs text-gray-400">
                            {row?.user?.email || "-"}
                        </span>

                        <span className="text-xs text-gray-400">
                            {row?.user?.contact || "-"}
                        </span>
                    </div>
                );
            },
        },
        {
            key: "amount",
            label: "Amount",
            render: row => (
                <span className="text-sm font-medium text-green-600">
                    ₹{Number(row?.totalAmount || 0)}
                </span>
            )
        },
        {
            key: "type",
            label: "Type",
            render: row => (
                <span className="text-sm capitalize">
                    {row?.type || "-"}
                </span>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (row) => {
                const config = STATUS_CONFIG[row?.status] || {};

                return (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${config.className || ""}`}>
                        {config.label || "Unknown"}
                    </span>
                );
            }
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
                        onClick={() => navigate(`/dashboard/leads/view/${row?.earnings?.[0]?.leadId?._id}?tab=details`)}
                    />

                    {row.status === "processing" && (
                        <>
                            <button
                                onClick={() => handleApprove(row._id)}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded"
                            >
                                Approve
                            </button>

                            <button
                                onClick={() => handleReject(row._id)}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                            >
                                Reject
                            </button>
                        </>
                    )}

                </div>
            )
        }
    ], [navigate]);

    // ✅ stats calculation (single source of truth)
    const statsData = useMemo(() => {
        let processingCount = 0;
        let paidCount = 0;
        let rejectedCount = 0;

        request.forEach(item => {
            const status = item.status || "earned";

            if (status === "processing") processingCount++;
            else if (status === "approved") paidCount++;
            else if (status === "rejected") rejectedCount++;
        });

        return [
            {
                label: "Processing Requests",
                value: processingCount,
                icon: Layers,
                iconBg: "bg-orange-100",
                iconColor: "text-orange-600",
            },
            {
                label: "Paid",
                value: paidCount,
                icon: Layers,
                iconBg: "bg-green-100",
                iconColor: "text-green-600",
            },
            {
                label: "Rejected",
                value: rejectedCount,
                icon: Layers,
                iconBg: "bg-red-100",
                iconColor: "text-red-600",
            },
        ];
    }, [request]);

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Withdraw Request", active: true },
                ]}
            />

            <StatsCards items={statsData} isLoading={isLoading} skeletonCount={2} />

            <SearchFilter value={searchTerm} onChange={setSearchTerm} />

            <BulkActionsBar
                selectedCount={selectedRequest.size}
                actions={[{ label: "Export Selected", action: "export" }]}
                onAction={handleBulkAction}
                onClear={() => setSelectedRequest(new Set())}
            />

            <DataTable
                columns={columns}
                data={paginatedData}
                isLoading={isLoading}
                selectable
                rowKey={row => row._id}
                selectedRows={selectedRequest}
                onSelectRow={toggleSelect}
                onSelectAll={handleSelectAll}
                showSerial
                startIndex={(pageFromURL - 1) * ITEMS_PER_PAGE}
            />

            <Pagination
                currentPage={pageFromURL}
                totalItems={totalItems}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
            />
        </div>
    );
}