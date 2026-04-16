import React, { useMemo, useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Users, ShieldCheck, UserX, UserPlus, Target, TrendingUp, AlertTriangle,
  UserMinus, CalendarDays, PhoneCall, CheckCircle, XCircle
} from "lucide-react";

// Components & Services
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import StatsCards from "../../components/common/StatsCards/StatsCards";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchSuperadminDashboard } from "../../services/queries/dashboardQuery";

// Chart.js imports
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler, zoomPlugin
);

// Constants moved outside to prevent re-creation
const RANGES = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "Last Month", value: "month" },
  { label: "Last Year", value: "year" },
];

const SHARED_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#111827",
      padding: 8,
      titleFont: { size: 11 },
      bodyFont: { size: 11 },
    },
  },
};

export default function SuperadminDashboard() {
  const chartRef = useRef(null);
  const [range, setRange] = useState("30d");
  const [isZoomed, setIsZoomed] = useState(false);

  // 1. Fetching logic with Query Optimization
  const { data, isLoading, isError } = useQuery({
    queryKey: ["superadmin-dashboard", range],
    queryFn: () => fetchSuperadminDashboard(range),
    staleTime: 1000 * 60 * 5, // 5 mins
    placeholderData: keepPreviousData,
    onError: () => toast.error("Failed to load dashboard"),
  });

  const rangeLabel = useMemo(() =>
    RANGES.find(r => r.value === range)?.label || "Custom Range",
    [range]);

  // 2. Optimized Zoom Reset
  const handleResetZoom = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
      setIsZoomed(false);
    }
  }, []);

  // 3. Memoized KPI Data Structures
  const statsData = useMemo(() => {
    if (!data) return { platform: [], users: [], leads: [], alerts: [] };
    const { platform = {}, users = {}, leads = {}, alerts = {} } = data;

    return {
      platform: [
        { label: "Total Admins", value: platform.totalAdmins, icon: Users, iconBg: "bg-blue-200", iconColor: "text-blue-600" },
        { label: "Active Admins", value: platform.activeAdmins, icon: ShieldCheck, iconBg: "bg-green-200", iconColor: "text-green-600" },
        { label: "Inactive Admins", value: platform.inactiveAdmins, icon: UserMinus, iconBg: "bg-red-200", iconColor: "text-red-600" },
        { label: `New Admins (${rangeLabel})`, value: platform.newAdmins, icon: UserPlus, iconBg: "bg-purple-200", iconColor: "text-purple-600" },
        { label: "Unverified Admins", value: platform.unverifiedAdmins, icon: UserX, iconBg: "bg-yellow-200", iconColor: "text-yellow-600" },
      ],

      users: [
        { label: "Total Partners", value: users.totalPartners, icon: Users, iconBg: "bg-cyan-200", iconColor: "text-cyan-600" },
        { label: "Total Counselors", value: users.totalCounselors, icon: Users, iconBg: "bg-teal-200", iconColor: "text-teal-600" },
        { label: "Team Leaders", value: users.totalTeamLeaders, icon: Users, iconBg: "bg-indigo-200", iconColor: "text-indigo-600" },
        { label: `Active Partners (${rangeLabel})`, value: users.activePartners, icon: Users, iconBg: "bg-green-200", iconColor: "text-green-600" },
        { label: `Active Counselors (${rangeLabel})`, value: users.activeCounselors, icon: Users, iconBg: "bg-emerald-200", iconColor: "text-emerald-600" },
        { label: "Inactive Partners", value: users.inactivePartners, icon: UserMinus, iconBg: "bg-red-200", iconColor: "text-red-600" },
        { label: "Inactive Counselors", value: users.inactiveCounselors, icon: UserMinus, iconBg: "bg-rose-200", iconColor: "text-rose-600" },
      ],

      leads: [
        { label: "Total Leads", value: leads.total, icon: Target, iconBg: "bg-indigo-200", iconColor: "text-indigo-600" },
        { label: "New Leads", value: leads.new, icon: UserPlus, iconBg: "bg-amber-200", iconColor: "text-amber-600" },
        { label: "Contacted Leads", value: leads.contacted, icon: PhoneCall, iconBg: "bg-blue-200", iconColor: "text-blue-600" },
        { label: "Converted Leads", value: leads.converted, icon: CheckCircle, iconBg: "bg-green-200", iconColor: "text-green-600" },
        { label: "Lost Leads", value: leads.lost, icon: XCircle, iconBg: "bg-red-200", iconColor: "text-red-600" },
      ],

      alerts: [
        { label: "Unassigned Leads", value: alerts.unassignedLeads, icon: AlertTriangle, iconBg: "bg-amber-200", iconColor: "text-amber-600" },
        { label: "Inactive Admins", value: alerts.inactiveAdmins, icon: UserMinus, iconBg: "bg-red-200", iconColor: "text-red-600" },
      ],
    };
  }, [data, rangeLabel]);

  // 4. Memoized Chart Data & Options
  const charts = useMemo(() => {
    if (!data) return null;
    const { trends = [], leads = {} } = data;

    const trendConfig = {
      labels: trends.map(d => new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "2-digit" })),
      datasets: [{
        label: "Leads Trend",
        data: trends.map(d => d.count),
        fill: false, tension: 0.4, borderWidth: 2, borderColor: "#6366F1", pointRadius: 3,
      }]
    };

    const commonData = [leads.new || 0, leads.converted || 0, leads.contacted || 0, leads.lost || 0];
    const commonColors = ["#6366F1", "#22C55E", "#F5530B", "#EF4444"];

    return {
      trend: trendConfig,
      distribution: {
        labels: ["New", "Converted", "Contacted", "Lost"],
        datasets: [{ data: commonData, backgroundColor: commonColors, borderRadius: 6 }]
      },
      composition: {
        labels: ["New", "Converted", "Contacted", "Lost"],
        datasets: [{ data: commonData, backgroundColor: commonColors, borderWidth: 0 }]
      }
    };
  }, [data]);

  if (isError) return (
    <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
      <h2 className="font-bold">Error loading dashboard</h2>
      <p className="text-sm">Please check your connection or try again later.</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Breadcrumbs items={[{ label: "Home", to: "/dashboard" }, { label: "Super Admin Dashboard" }]} />
        <div className="flex items-center gap-2 bg-white border rounded-xl px-3 py-2 shadow-sm">
          <CalendarDays size={18} className="text-gray-400" />
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-gray-700"
          >
            {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {/* METRICS SECTIONS */}
      {[
        { title: "Platform Metrics", key: "platform", count: 5 },
        { title: "User Metrics", key: "users", count: 7 },
        { title: "Lead Metrics", key: "leads", count: 5 }
      ].map(section => (
        <section key={section.key} className="bg-white border rounded-xl p-4 space-y-3 shadow-sm">
          <h2 className="text-xs uppercase tracking-wider font-bold text-gray-500">{section.title}</h2>
          <StatsCards items={statsData[section.key]} isLoading={isLoading} skeletonCount={section.count} />
        </section>
      ))}

      {/* CHARTS */}
      {charts && (
        <div className="space-y-5">
          {/* Trend Line Chart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 h-[350px] flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800">Leads Trend Analysis</h3>
              <button
                onClick={handleResetZoom}
                disabled={!isZoomed}
                className={`text-[11px] px-3 py-1 rounded-lg border transition font-medium
                  ${isZoomed ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" : "bg-gray-50 text-gray-400 border-gray-100 opacity-50 cursor-not-allowed"}`}
              >
                Reset Zoom
              </button>
            </div>
            <div className="flex-1">
              <Line
                ref={chartRef}
                data={charts.trend}
                options={{
                  ...SHARED_CHART_OPTIONS,
                  interaction: { mode: "index", intersect: false },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                    y: {
                      min: 0,
                      grid: { color: "#F9FAFB" },
                      ticks: {
                        stepSize: 1, // ✅ integers only
                        precision: 0,
                        callback: (v) => v.toString(),
                      },
                    }
                  },
                  plugins: {
                    ...SHARED_CHART_OPTIONS.plugins,
                    zoom: {
                      pan: { enabled: true, mode: "x" },
                      zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x", onZoomComplete: () => setIsZoomed(true) }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Distribution Bar Chart */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 h-[320px] flex flex-col shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Leads Distribution</h3>
              <div className="flex-1">
                <Bar
                  data={charts.distribution}
                  options={{
                    ...SHARED_CHART_OPTIONS,
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 } },
                      },
                      y: {
                        min: 0,
                        grid: { color: "#F3F4F6" },
                        ticks: {
                          stepSize: 1,     // ✅ force 0,1,2,3...
                          precision: 0,    // ✅ remove decimals
                          callback: (v) => v.toString(),
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Composition Doughnut */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 h-[320px] flex flex-col shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Lead Composition</h3>
              <div className="flex-1">
                <Doughnut
                  data={charts.composition}
                  options={{
                    ...SHARED_CHART_OPTIONS,
                    cutout: "75%",
                    plugins: { ...SHARED_CHART_OPTIONS.plugins, legend: { display: true, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } } } }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}