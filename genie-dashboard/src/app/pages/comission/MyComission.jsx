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
    }
};

export default function MyComission() {
    const navigate = useNavigate();
    const [commission, setCommission] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCommission, setSelectedCommission] = useState(new Set());
    const [searchParams, setSearchParams] = useSearchParams();

    const [activeTab, setActiveTab] = useState("earnings"); // earnings | withdraw
    const [withdrawHistory, setWithdrawHistory] = useState([]);

    const pageFromURL = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const prevSearchRef = useRef(debouncedSearch);

    // ✅ reset page on search
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

    // ✅ fetch Commission
    const fetchCommission = async () => {
        try {
            setIsLoading(true);
            const { data } = await API.get("/my-commission");

            const list = Array.isArray(data?.data) ? data.data : [];
            setCommission(list);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch commission");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWithdrawHistory = async () => {
        try {
            const { data } = await API.get("/my-withdraws");
            setWithdrawHistory(data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCommission();
        fetchWithdrawHistory();
    }, []);

    // ✅ search filter
    const filteredData = useMemo(() => {
        if (!debouncedSearch) return commission;

        const term = debouncedSearch.toLowerCase();
        return commission.filter(row =>
            row?.leadId?.name?.toLowerCase().includes(term) ||
            row?.leadId?.contact?.toLowerCase().includes(term)
        );
    }, [commission, debouncedSearch]);

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
        setSelectedCommission(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        if (!paginatedData.length) return;

        const pageIds = paginatedData.map(row => row._id);
        const allSelected = pageIds.every(id => selectedCommission.has(id));
        const next = new Set(selectedCommission);

        if (allSelected) pageIds.forEach(id => next.delete(id));
        else pageIds.forEach(id => next.add(id));

        setSelectedCommission(next);
    }, [paginatedData, selectedCommission]);

    // ✅ export
    const exportSelectedRows = useCallback((rows) => {
        try {
            const headers = ["Lead", "Contact", "Amount", "Status"].join(",");

            const csvRows = rows.map(row => [
                `"${row?.leadSnapshot?.name || ""}"`,
                `"${row?.leadSnapshot?.contact || ""}"`,
                `"${row.amount || 0}"`,
                `"${row.status || ""}"`
            ].join(","));

            const blob = new Blob([[headers, ...csvRows].join("\n")], {
                type: "text/csv;charset=utf-8;"
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "commission.csv";
            link.click();

            URL.revokeObjectURL(url);
            toast.success("Export successful");
        } catch (error) {
            console.error(error);
            toast.error("Export failed");
        }
    }, []);

    const handleBulkAction = useCallback(() => {
        if (!selectedCommission.size) {
            toast.error("Select at least one row");
            return;
        }

        const selectedRows = commission.filter(row =>
            selectedCommission.has(row._id)
        );

        exportSelectedRows(selectedRows);
    }, [selectedCommission, commission, exportSelectedRows]);

    const handleWithdrawSingle = async (row) => {
        try {
            if (row.status !== "earned") {
                return toast.error("Only available earnings can be withdrawn");
            }

            // ✅ Confirm Modal
            const result = await Swal.fire({
                title: "Confirm Withdrawal",
                text: `Withdraw ₹${row.amount}?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#2563eb",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, Withdraw",
                cancelButtonText: "Cancel"
            });

            if (!result.isConfirmed) return;

            // ✅ Loader while API call
            Swal.fire({
                title: "Processing...",
                text: "Please wait while we process your request",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const { data } = await API.post("/request-withdraw", {
                ids: [row._id],
                type: "commission"
            });

            Swal.close();

            if (data.success) {
                await Swal.fire({
                    title: "Success",
                    text: data.message,
                    icon: "success",
                    confirmButtonColor: "#16a34a"
                });

                fetchCommission(); // refresh
            }

        } catch (error) {
            Swal.close();

            Swal.fire({
                title: "Error",
                text: error?.response?.data?.error || "Withdraw failed",
                icon: "error",
                confirmButtonColor: "#dc2626"
            });
        }
    };

    // ✅ earning table columns
    const earningColumns = useMemo(() => [
        {
            key: "lead",
            label: "Lead",
            render: row => (
                <span className="text-sm font-medium">
                    {row?.leadSnapshot?.name || "-"}
                </span>
            )
        },
        {
            key: "amount",
            label: "Amount",
            render: row => (
                <span className="text-sm font-medium text-green-600">
                    ₹{Number(row?.amount || 0)}
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
            render: (row) => {
                const isWithdrawable = row?.status === "earned";

                return (
                    <div className="flex gap-2">
                        {/* View Button */}
                        <ActionIconButton
                            label="View"
                            Icon={Eye}
                            variant="neutral"
                            onClick={() =>
                                navigate(`/dashboard/leads/view/${row?.leadId}?tab=details`)
                            }
                        />

                        {/* Withdraw Button */}
                        <button
                            disabled={!isWithdrawable}
                            onClick={() => handleWithdrawSingle(row)}
                            className={`px-2 py-1 text-xs rounded ${isWithdrawable
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            Withdraw
                        </button>
                    </div>
                );
            }
        }
    ], [navigate]);

    // ✅ earning table columns
    const withdrawHistoryColumns = useMemo(() => [
        {
            key: "lead",
            label: "Lead",
            render: (row) => (
                <span className="text-sm font-medium">
                    {row?.earnings?.[0]?.leadId?.name || "-"}
                </span>
            )
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
            key: "status",
            label: "Status",
            render: (row) => {
                const statusMap = {
                    processing: "bg-orange-100 text-orange-700",
                    approved: "bg-green-100 text-green-700",
                    rejected: "bg-red-100 text-red-700"
                };

                return (
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusMap[row.status] || ""}`}>
                        {row.status}
                    </span>
                );
            }
        },
        {
            key: "reason",
            label: "Reason",
            render: row => (
                <span className="text-xs text-gray-600">
                    {row.reason || "-"}
                </span>
            )
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
                        onClick={() => handleViewWithdraw(row)}
                    />
                </div>
            )
        }
    ]);

    // ✅ stats calculation (single source of truth)
    const statsData = useMemo(() => {
        let total = 0;
        let earned = 0;
        let processing = 0;
        let paid = 0;

        commission.forEach(item => {
            const amount = Number(item.amount) || 0;
            const status = item.status || "earned";

            total += amount;

            if (status === "earned") earned += amount;
            else if (status === "processing") processing += amount;
            else if (status === "paid") paid += amount;
        });
        return [
            {
                label: "Total Earnings",
                value: total, // ✅ NUMBER
                icon: Layers,
                iconBg: "bg-blue-100",
                iconColor: "text-blue-600",
            },
            {
                label: "Available Balance",
                value: earned, // ✅ NUMBER
                icon: Layers,
                iconBg: "bg-yellow-100",
                iconColor: "text-yellow-600",
            },
            {
                label: "In Processing",
                value: processing, // ✅ NUMBER
                icon: Layers,
                iconBg: "bg-orange-100",
                iconColor: "text-orange-600",
            },
            {
                label: "Paid (Withdrawn)",
                value: paid, // ✅ NUMBER
                icon: Layers,
                iconBg: "bg-green-100",
                iconColor: "text-green-600",
            },
        ];
    }, [commission]);

    const handleViewWithdraw = (row) => {
        try {
            const requestedAt = row.requestedAt ? new Date(row.requestedAt).toLocaleString() : "-";
            const processedAt = row.processedAt ? new Date(row.processedAt).toLocaleString() : "-";

            Swal.fire({
                title: "Withdraw Details",
                html: `<table style="text-align:left;width:100%">
                            <tr><td><b>Amount:</b></td><td>₹${row.totalAmount ?? 0}</td></tr>
                            <tr><td><b>Status:</b></td><td>${row.status ?? "-"}</td></tr>
                            <tr><td><b>Reason:</b></td><td>${row.reason || "-"}</td></tr>
                            <tr><td><b>Requested At:</b></td><td>${requestedAt}</td></tr>
                            <tr><td><b>Processed At:</b></td><td>${processedAt}</td></tr>
                        </table>`,
                icon: "info",
                confirmButtonText: "Close"
            });
        } catch (err) {
            console.error("Withdraw view error:", err);
            Swal.fire("Error", "Failed to load withdraw details", "error");
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "My Commission", active: true },
                ]}
            />

            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab("earnings")}
                    className={`px-4 py-2 rounded ${activeTab === "earnings" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                    Earnings
                </button>

                <button
                    onClick={() => setActiveTab("withdraw")}
                    className={`px-4 py-2 rounded ${activeTab === "withdraw" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                    Withdraw History
                </button>
            </div>

            <StatsCards items={statsData} isLoading={isLoading} skeletonCount={4} />

            <SearchFilter value={searchTerm} onChange={setSearchTerm} />

            <BulkActionsBar
                selectedCount={selectedCommission.size}
                actions={[{ label: "Export Selected", action: "export" }]}
                onAction={handleBulkAction}
                onClear={() => setSelectedCommission(new Set())}
            />

            {activeTab === "earnings" && (
                <DataTable
                    columns={earningColumns}
                    data={paginatedData}
                    isLoading={isLoading}
                    selectable
                    rowKey={row => row._id}
                    selectedRows={selectedCommission}
                    onSelectRow={toggleSelect}
                    onSelectAll={handleSelectAll}
                    showSerial
                    startIndex={(pageFromURL - 1) * ITEMS_PER_PAGE}
                />
            )}

            {activeTab === "withdraw" && (
                <DataTable
                    columns={withdrawHistoryColumns}
                    data={withdrawHistory}
                    isLoading={isLoading}
                    rowKey={row => row._id}
                    showSerial
                />
            )}

            <Pagination
                currentPage={pageFromURL}
                totalItems={totalItems}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
            />
        </div>
    );
}