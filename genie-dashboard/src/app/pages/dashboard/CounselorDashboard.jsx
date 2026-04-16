import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    Target, UserCheck, AlertTriangle, Clock, Percent, CalendarDays
} from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { fetchCounselorDashboard } from "../../services/queries/dashboardQuery";

import StatsCards from "../../components/common/StatsCards/StatsCards";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import DataTable from "../../components/common/DataTable/DataTable";
import LeadStatusBadge from "../../components/ui/Badge/LeadStatusBadge";

import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    ArcElement, Tooltip, Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// Define outside component to prevent re-renders
const RANGES = [
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "Last 90 Days", value: "90d" },
    { label: "This Month", value: "month" },
    { label: "This Year", value: "year" },
];

const isToday = (date) => {
    if (!date) return false;
    const d = new Date(date);
    const today = new Date();
    return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
    );
};

export default function CounselorDashboard() {
    // Local state for the selected range
    const [range, setRange] = useState("30d");

    /* ================= FETCH (TanStack Query v5) ================= */
    const { data, isLoading, isError } = useQuery({
        queryKey: ["counselor-dashboard", range],
        queryFn: () => fetchCounselorDashboard(range),
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    });

    if (isError) {
        toast.error("Failed to load dashboard");
        return (
            <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
                <h2 className="font-semibold">Failed to load counselor dashboard data.</h2>
                <p className="text-sm">Please try refreshing the page.</p>
            </div>
        );
    }

    /* ================= SAFE DATA EXTRACTION ================= */
    const {
        statusFunnel = {},
        alerts = {},
        performance = {},
        followUpsToday = [],
        upcomingFollowUps = [],
        newAssignedLeads = [],
        assignedLeads = [],
        activities = []
    } = data || {};

    /* ================= STATS ================= */
    const statsData = useMemo(() => [
        { label: "Assigned Leads", value: data?.totalAssignedLeads ?? 0, icon: Target, iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
        { label: "Leads Added by You", value: data?.totalAddedLeads ?? 0, icon: UserCheck, iconBg: "bg-green-100", iconColor: "text-green-600" },
        { label: "Converted Leads", value: data?.statusFunnel?.converted ?? 0, icon: Percent, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
        { label: "Missed Follow-ups", value: alerts.missedFollowUps ?? 0, icon: AlertTriangle, iconBg: "bg-red-100", iconColor: "text-red-600" },
        { label: "Stale Leads", value: alerts.staleLeads ?? 0, icon: Clock, iconBg: "bg-gray-100", iconColor: "text-gray-600" },
    ], [data, performance, alerts]);

    /* ================= CHART CONFIGS ================= */
    const chartConfigs = useMemo(() => {
        if (!data) return null;
        return {
            funnel: {
                labels: ["New", "Contacted", "Converted", "Lost"],
                datasets: [{
                    label: "Lead Funnel",
                    data: [statusFunnel.new ?? 0, statusFunnel.contacted ?? 0, statusFunnel.converted ?? 0, statusFunnel.lost ?? 0],
                    backgroundColor: ["#6366F1", "#F5530B", "#10B981", "#EF4444"],
                    borderRadius: 6,
                }],
            },
            alerts: {
                labels: ["Missed Follow-ups", "Stale Leads"],
                datasets: [{
                    data: [
                        alerts.missedFollowUps ?? 0,
                        alerts.staleLeads ?? 0
                    ],
                    backgroundColor: ["#EF4444", "#9CA3AF"],

                    // ✅ FIXES
                    borderWidth: 0,        // remove gap
                    spacing: 0,            // remove segment spacing
                    hoverOffset: 0         // prevent hover shift gap
                }]
            }
        };
    }, [data, statusFunnel, alerts]);

    /* ================= TABLE COLUMNS ================= */
    const leadColumns = useMemo(() => [
        {
            key: "name",
            label: "Lead Name",
            sortable: true,
            render: (lead) => (
                <span className="font-medium text-sm text-gray-900">
                    {lead.name || "N/A"}
                </span>
            ),
        },
        {
            key: "city",
            label: "City",
            sortable: true,
            render: (lead) => (
                <span className="text-sm text-gray-600">
                    {lead.city || "N/A"}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            sortable: false,
            render: (lead) => (
                <LeadStatusBadge
                    status={lead?.status}
                />
            ),
        },
    ], []);

    function LegendBadge({ color, label, value }) {
        return (
            <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-gray-600">{label}</span>
                <span className="font-semibold text-gray-800">{value ?? 0}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* HEADER TOOLBAR */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <Breadcrumbs items={[{ label: "Home", to: "/dashboard" }, { label: "Counselor Dashboard" }]} />

                {/* DATE RANGE SELECTOR */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm w-full md:w-auto">
                    <CalendarDays size={18} className="text-gray-500" />
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        className="bg-transparent text-sm text-gray-700 focus:outline-none cursor-pointer w-full"
                    >
                        {RANGES.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <StatsCards items={statsData} isLoading={isLoading} skeletonCount={5} />

            {/* CHARTS */}
            {chartConfigs && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                    {/* -------- Lead Funnel -------- */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 h-[320px] flex flex-col shadow-sm hover:shadow-md transition">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-800">Lead Funnel</h3>

                            <span className="text-[11px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-medium">
                                Total: {(statusFunnel.new ?? 0) + (statusFunnel.contacted ?? 0) + (statusFunnel.converted ?? 0) + (statusFunnel.lost ?? 0)}
                            </span>
                        </div>

                        {/* Chart */}
                        <div className="flex-1">
                            <Bar
                                data={chartConfigs.funnel}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            backgroundColor: "#111827",
                                            padding: 8,
                                            titleFont: { size: 11 },
                                            bodyFont: { size: 11 },
                                            callbacks: {
                                                label: (ctx) => `${ctx.label}: ${ctx.raw}`,
                                            },
                                        },
                                    },
                                    scales: {
                                        x: {
                                            grid: { display: false },
                                            ticks: { color: "#6B7280", font: { size: 10 } },
                                        },
                                        y: {
                                            beginAtZero: true,
                                            grid: { color: "#F3F4F6" },
                                            ticks: { precision: 0, color: "#6B7280", font: { size: 10 } },
                                        },
                                    },
                                }}
                            />
                        </div>

                        {/* Summary */}
                        <div className="grid grid-cols-4 mt-3 pt-3 border-t text-center text-xs">
                            <div>
                                <p className="font-semibold text-indigo-600">{statusFunnel.new ?? 0}</p>
                                <p className="text-gray-500">New</p>
                            </div>
                            <div>
                                <p className="font-semibold text-orange-600">{statusFunnel.contacted ?? 0}</p>
                                <p className="text-gray-500">Contacted</p>
                            </div>
                            <div>
                                <p className="font-semibold text-green-600">{statusFunnel.converted ?? 0}</p>
                                <p className="text-gray-500">Converted</p>
                            </div>
                            <div>
                                <p className="font-semibold text-red-600">{statusFunnel.lost ?? 0}</p>
                                <p className="text-gray-500">Lost</p>
                            </div>
                        </div>
                    </div>

                    {/* -------- Lead Alerts -------- */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 h-[320px] flex flex-col shadow-sm hover:shadow-md transition">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-800">Lead Alerts</h3>

                            <span className="text-[11px] bg-red-50 text-red-600 px-2 py-1 rounded-md font-medium">
                                Total: {(alerts.missedFollowUps ?? 0) + (alerts.staleLeads ?? 0)}
                            </span>
                        </div>

                        {/* Chart */}
                        <div className="flex-1 flex items-center justify-center">
                            <div className="relative w-full max-w-[200px] aspect-square">
                                <Doughnut
                                    data={chartConfigs.alerts}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        cutout: "70%",
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                backgroundColor: "#111827",
                                                padding: 8,
                                                titleFont: { size: 11 },
                                                bodyFont: { size: 11 },
                                                callbacks: {
                                                    label: (ctx) => `${ctx.label}: ${ctx.raw}`,
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex justify-center gap-6 mt-3 text-xs">
                            <LegendBadge
                                color="bg-red-500"
                                label="Missed"
                                value={alerts.missedFollowUps}
                            />
                            <LegendBadge
                                color="bg-gray-400"
                                label="Stale"
                                value={alerts.staleLeads}
                            />
                        </div>
                    </div>

                </div>
            )}

            {/* LISTS: Followups + New Leads */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white shadow rounded-xl p-5">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        Follow-ups Today
                    </h3>

                    {followUpsToday.length === 0 ? (
                        <p className="text-sm text-gray-500">No follow-ups scheduled</p>
                    ) : (
                        <ul className="space-y-3">
                            {followUpsToday.map((lead, idx) => {
                                const todayHighlight = isToday(lead.followUpDate);

                                return (
                                    <li
                                        key={idx}
                                        className={`flex justify-between items-center text-sm border-b pb-2 last:border-none transition
              ${todayHighlight
                                                ? "bg-emerald-50 border-emerald-200 rounded-lg px-3 py-2"
                                                : "border-gray-100"
                                            }`}
                                    >
                                        <span
                                            className={`font-medium ${todayHighlight ? "text-emerald-700" : "text-gray-800"
                                                }`}
                                        >
                                            {lead.name || "Unnamed Lead"}
                                        </span>

                                        <span
                                            className={`text-xs ${todayHighlight ? "text-emerald-600 font-medium" : "text-gray-500"
                                                }`}
                                        >
                                            {lead.followUpDate
                                                ? new Date(lead.followUpDate).toLocaleDateString()
                                                : "Today"}
                                            {lead.followUpTime ? ` • ${lead.followUpTime}` : ""}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <div className="bg-white shadow rounded-xl p-5">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Upcoming Follow-ups</h3>
                    {upcomingFollowUps.length === 0 ? (
                        <p className="text-sm text-gray-500">No upcoming follow-ups</p>
                    ) : (
                        <ul className="space-y-3">
                            {upcomingFollowUps.map((lead, idx) => (
                                <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-none">
                                    <span className="font-medium text-gray-800">{lead.name || "Unnamed Lead"}</span>
                                    <span className="text-gray-500 text-xs">
                                        {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : "Scheduled"}
                                        {lead.followUpTime ? ` • ${lead.followUpTime}` : ""}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="bg-white shadow rounded-xl p-5">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">New Assigned Leads</h3>
                    {newAssignedLeads.length === 0 ? (
                        <p className="text-sm text-gray-500">No new assigned leads</p>
                    ) : (
                        <ul className="space-y-3">
                            {newAssignedLeads.map((lead, idx) => (
                                <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-none">
                                    <span className="font-medium text-gray-800">{lead.name || "Unnamed Lead"}</span>
                                    <span className="text-gray-500 text-xs">{lead.city || "N/A"}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* ASSIGNED LEADS TABLE */}
            <div className="bg-white shadow rounded-xl p-5">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Assigned Leads</h3>
                <DataTable
                    columns={leadColumns}
                    data={assignedLeads.slice(0, 5)}
                    isLoading={isLoading}
                    selectable={false}
                    rowKey={(l) => l._id}
                />
            </div>

            {/* ACTIVITY TIMELINE */}
            <div className="bg-white shadow rounded-xl p-5">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Activity Timeline</h3>
                {activities.length === 0 ? (
                    <p className="text-sm text-gray-500">No recent activity</p>
                ) : (
                    <ul className="space-y-4">
                        {activities.map((a, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start">
                                <span className="w-2 h-2 mt-1.5 mr-2 rounded-full bg-indigo-500 flex-shrink-0"></span>
                                <div>
                                    <p>{a.message}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{new Date(a.time).toLocaleString()}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* PERFORMANCE METER */}
            {/* <div className="bg-white shadow rounded-xl p-5">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Performance Meter</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x divide-gray-100">
                    <div>
                        <p className="text-2xl font-bold text-indigo-600">{performance.callsToday ?? 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Calls Today</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green-600">{performance.conversionRate ?? 0}%</p>
                        <p className="text-xs text-gray-500 mt-1">Conversion Rate</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-red-600">{performance.missedFollowUps ?? 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Missed Follow-ups</p>
                    </div>
                </div>
            </div> */}
        </div>
    );
}