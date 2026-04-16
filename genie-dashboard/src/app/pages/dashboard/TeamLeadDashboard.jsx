import React, { useMemo, useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import {
  Users, Target, TrendingUp, UserCheck, CalendarDays,
} from "lucide-react";
import { Link } from "react-router-dom";

import { fetchTeamLeaderDashboard } from "../../services/queries/dashboardQuery";
import StatsCards from "../../components/common/StatsCards/StatsCards";

import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend
} from "chart.js";
import LeadStatusBadge from "../../components/ui/Badge/LeadStatusBadge";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const RANGES = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

export default function TeamLeadDashboard() {
  const [range, setRange] = useState("30d");
  const [groupBy, setGroupBy] = useState("month");

  /* ---------------- FETCH ---------------- */
  const { data, isLoading, isError } = useQuery({
    queryKey: ["teamleader-dashboard", range, groupBy],
    queryFn: () => fetchTeamLeaderDashboard(range, groupBy),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });

  /* ---------------- ERROR TOAST FIX ---------------- */
  useEffect(() => {
    if (isError) toast.error("Failed to load dashboard");
  }, [isError]);

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
        <h2 className="font-semibold">Failed to load team leader dashboard data.</h2>
        <p className="text-sm">Please try refreshing the page.</p>
      </div>
    );
  }

  /* ---------------- DATA EXTRACTION ---------------- */
  const {
    stats = {},
    counselors = [],
    recentLeads = [],
    analytics = {},
    funnel = {}
  } = data || {};

  const trendData = analytics.trend || [];

  /* ---------------- TOTAL LEADS ---------------- */
  const totalLeads = useMemo(() => (
    (funnel.new || 0) +
    (funnel.converted || 0) +
    (funnel.lost || 0)
  ), [funnel]);

  /* ---------------- CHART CONFIG ---------------- */
  const chartConfigs = useMemo(() => ({
    funnel: {
      labels: ["New", "Converted", "Lost"],
      datasets: [{
        data: [
          funnel.new ?? 0,
          funnel.converted ?? 0,
          funnel.lost ?? 0
        ],
        backgroundColor: [
          "#6366F1", // New
          "#22C55E", // ✅ Converted (Green)
          "#EF4444"  // Lost
        ],
        borderWidth: 0,
      }],
    },
    trend: {
      labels: trendData.map((t) => {
        if (groupBy === "week") {
          // t.period is "2026-W14"
          return t.period.split("-")[1]; // Returns "W14"
        }

        // Fix: Ensure we parse the year-month correctly without TZ shifts
        const [year, month] = t.period.split("-");
        const date = new Date(year, parseInt(month) - 1, 1);
        return date.toLocaleString("en-IN", { month: "short" });
      }),
      datasets: [{
        label: "Leads",
        data: trendData.map((t) => t.count),
        backgroundColor: "#6366F1",
        borderRadius: 8,
        barThickness: groupBy === "week" ? 20 : 40, // Adjust thickness for many weeks
      }],
    }
  }), [funnel, trendData, groupBy]);
  const hasTrendData = trendData.length > 0;

  /* ---------------- KPI CARDS ---------------- */
  const statsItems = useMemo(() => [
    {
      label: "Total Leads",
      value: stats.totalTeamLeads || 0,
      icon: Target,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    }, {
      label: "My Leads",
      value: stats.myLeads || 0,
      icon: Target,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      label: "Conversion Rate",
      value: `${stats.conversionRate || 0}%`,
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Assigned Today",
      value: stats.assignedToday || 0,
      icon: CalendarDays,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Counselors",
      value: stats.activeCounselors || 0,
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ], [stats]);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Breadcrumbs items={[{ label: "Home", to: "/dashboard" }, { label: "Team Leader Dashboard" }]} />

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm w-full md:w-auto">
          <CalendarDays size={18} className="text-gray-500" />
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-transparent text-sm text-gray-700 focus:outline-none cursor-pointer w-full"
          >
            {RANGES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600">Lead Metrics</h2>

        <StatsCards
          items={statsItems}
          isLoading={isLoading}
          skeletonCount={5}
        />
      </div>

      {/* CHARTS */}
      {chartConfigs && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* FUNNEL */}
          <div className="bg-white border shadow-sm rounded-2xl p-6 relative">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Lead Funnel
            </h3>

            <div className="h-[230px] flex items-center justify-center relative">
              <Doughnut
                data={chartConfigs.funnel}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "75%",
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />

              {/* CENTER TEXT */}
              <div className="absolute text-center">
                <p className="text-xl font-bold">{totalLeads}</p>
                <p className="text-xs text-gray-500">Total Leads</p>
              </div>
            </div>

            <div className="flex justify-center gap-6 mt-4 text-sm">
              <LegendBadge color="bg-indigo-500" label="New" value={funnel.new} />
              <LegendBadge color="bg-green-500" label="Converted" value={funnel.converted} />
              <LegendBadge color="bg-red-500" label="Lost" value={funnel.lost} />
            </div>
          </div>

          {/* TREND */}
          <div className="bg-white border shadow-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {groupBy === "week" ? "Weekly Leads Trend" : "Monthly Leads Trend"}
              </h3>

              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white cursor-pointer focus:outline-none"
              >
                <option value="month">Monthly</option>
                <option value="week">Weekly</option>
              </select>
            </div>

            <div className="h-[230px]">
              {!hasTrendData ? (
                <p className="text-sm text-gray-500 text-center">No data available</p>
              ) : (
                <Bar
                  data={chartConfigs.trend}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false } },
                      y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

        </div>
      )}

      {/* TABLE */}
      <div className="bg-white shadow rounded-xl p-5 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Latest 5 Leads</h3>

        {recentLeads.length === 0 ? (
          <p className="text-sm text-gray-500">No leads found</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Lead</th>
                <th className="py-2 pr-4">Contact</th>
                <th className="py-2 pr-4">City</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead) => (
                <tr key={lead._id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">
                    <Link
                      to={`/dashboard/leads/view/${lead._id}?tab=details`}
                      className="hover:underline hover:text-blue-600 transition-colors"
                    >
                      {lead.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{lead.contact}</td>
                  <td className="py-2 pr-4">{lead.city || "-"}</td>
                  <td className="py-2 pr-4">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="py-2 pr-4">
                    {lead.createdAt
                      ? new Date(lead.createdAt).toLocaleDateString("en-IN")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

function LegendBadge({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-800">{value ?? 0}</span>
    </div>
  );
}