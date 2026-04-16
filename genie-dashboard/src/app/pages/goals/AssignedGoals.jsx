import React, { useMemo, useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Target, CheckCircle2, Clock } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";

// UI
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import SearchFilter from "../../components/common/SearchFilter/SearchFilter";
import DataTable from "../../components/common/DataTable/DataTable";
import Pagination from "../../components/common/Pagination/Pagination";
import StatsCards from "../../components/common/StatsCards/StatsCards";

// API + utils
import { API } from "../../services/API";
import useDebounce from "../../utils/useDebounce";

const ITEMS_PER_PAGE = 10;

/* =========================
    API
========================= */
const fetchAssignedGoals = async ({ page, search }) => {
    const { data } = await API.get("/assigned-goals", {
        params: { page, limit: ITEMS_PER_PAGE, search }
    });
    return data;
};

export default function AssignedGoals() {

    const [searchParams, setSearchParams] = useSearchParams();

    const pageFromURL = Math.max(1, parseInt(searchParams.get("page")) || 1);

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const prevSearchRef = useRef(debouncedSearch);

    // reset page on search change
    useEffect(() => {
        if (prevSearchRef.current !== debouncedSearch) {
            setSearchParams(prev => {
                const p = new URLSearchParams(prev);
                p.set("page", "1");
                return p;
            });
            prevSearchRef.current = debouncedSearch;
        }
    }, [debouncedSearch, setSearchParams]);

    /* =========================
        QUERY
    ========================= */
    const { data, isLoading, isError } = useQuery({
        queryKey: ["assigned-goals", pageFromURL, debouncedSearch],
        queryFn: () => fetchAssignedGoals({ page: pageFromURL, search: debouncedSearch }),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5
    });

    const goals = data?.data || [];
    const pagination = data?.pagination || {};

    /* =========================
        TABLE COLUMNS
    ========================= */
    const formatGoalType = (type) =>
        type?.replaceAll("_", " ").replace(/\b\w/g, l => l.toUpperCase()) || "Goal";

    const columns = useMemo(() => [
        {
            key: "counselor",
            label: "Counselor",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                        {row?.counselorId?.name || "—"}
                    </span>
                    <span className="text-xs text-gray-400">
                        {row?.counselorId?.email || ""}
                    </span>
                </div>
            )
        },
        {
            key: "goalType",
            label: "Goal",
            render: (row) => (
                <span className="font-medium text-gray-700">
                    {formatGoalType(row.goalType)}
                </span>
            )
        },
        {
            key: "progress",
            label: "Progress",
            render: (row) => {
                const percent = Math.min(
                    Math.round((row.currentValue / row.targetValue) * 100),
                    100
                );

                return (
                    <div className="w-40">
                        <div className="text-xs text-gray-500 mb-1">
                            {row.currentValue}/{row.targetValue}
                        </div>
                        <div className="w-full bg-gray-200 rounded h-2">
                            <div
                                className="bg-blue-600 h-2 rounded"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                    </div>
                );
            }
        },
        {
            key: "status",
            label: "Status",
            render: (row) => {
                const map = {
                    active: "bg-blue-100 text-blue-600",
                    completed: "bg-green-100 text-green-600",
                    expired: "bg-red-100 text-red-600"
                };
                return (
                    <span className={`px-2 py-1 text-xs rounded ${map[row.status] || "bg-gray-100"}`}>
                        {row.status}
                    </span>
                );
            }
        },
        {
            key: "assignedBy",
            label: "Assigned By",
            render: (row) => (
                <span className="text-sm text-gray-600">
                    {row?.assignedBy?.name || "—"}
                </span>
            )
        },
        {
            key: "dates",
            label: "Duration",
            render: (row) => (
                <div className="text-xs text-gray-500">
                    <div>{new Date(row.startDate).toLocaleDateString()}</div>
                    <div>{new Date(row.endDate).toLocaleDateString()}</div>
                </div>
            )
        }
    ], []);

    /* =========================
        STATS
    ========================= */
    const statsData = useMemo(() => [
        {
            label: "Total Goals",
            value: pagination.total || goals.length || 0,
            icon: Target,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            label: "Active",
            value: goals.filter(g => g.status === "active").length,
            icon: Clock,
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600"
        },
        {
            label: "Completed",
            value: goals.filter(g => g.status === "completed").length,
            icon: CheckCircle2,
            iconBg: "bg-green-100",
            iconColor: "text-green-600"
        }
    ], [goals, pagination.total]);

    if (isError) {
        toast.error("Failed to load goals");
        return <div className="p-6 text-red-500">Error loading goals</div>;
    }

    /* =========================
        UI
    ========================= */
    return (
        <div className="space-y-6">

            <Breadcrumbs items={[
                { label: "Dashboard", to: "/dashboard" },
                { label: "Assigned Goals", active: true }
            ]} />

            <StatsCards items={statsData} isLoading={isLoading} />

            <SearchFilter value={searchTerm} onChange={setSearchTerm} />

            <DataTable
                columns={columns}
                data={goals}
                isLoading={isLoading}
                rowKey={(row) => row._id}
                showSerial
                startIndex={(pageFromURL - 1) * ITEMS_PER_PAGE}
            />

            <Pagination
                currentPage={pageFromURL}
                totalItems={pagination.total || 0}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={(page) => {
                    setSearchParams(prev => {
                        const p = new URLSearchParams(prev);
                        p.set("page", page);
                        return p;
                    });
                }}
            />
        </div>
    );
}