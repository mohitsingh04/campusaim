import React, { useMemo, useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  Users,
  UserCheck,
  Target,
  TrendingUp,
  AlertTriangle,
  Clock,
  UserMinus,
  Percent,
} from "lucide-react";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchAdminDashboard } from "../../services/queries/dashboardQuery";

import StatsCards from "../../components/common/StatsCards/StatsCards";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";

import { Line, Bar, Doughnut } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { useNavigate } from "react-router-dom";
import { API } from "../../services/API";
import { useAuth } from "../../context/AuthContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
  zoomPlugin
);

const LEAD_STATUS_COLORS = {
  new: "#6366F1",        // Indigo
  converted: "#10B981",  // Green
  contacted: "#F97316",  // Orange (slightly better than your #F5530B)
  lost: "#EF4444",       // Red
};

/* ---------------- CENTER TEXT PLUGIN ---------------- */

const centerTextPlugin = {
  id: "centerText",
  beforeDraw(chart) {
    if (chart.config.type !== "doughnut") return;

    const { width, height, ctx } = chart;

    // ✅ SAFE ACCESS
    const dataset = chart?.data?.datasets?.[0];
    const values = Array.isArray(dataset?.data) ? dataset.data : [];

    const total = values.reduce((a, b) => a + b, 0);

    ctx.save();

    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = "#111827";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(total, width / 2, height / 2 - 5);

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#6B7280";
    ctx.fillText("Total Leads", width / 2, height / 2 + 16);

    ctx.restore();
  },
};

ChartJS.register(centerTextPlugin);

/* ---------------- DATE FILTER ---------------- */

const RANGES = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

export default function AdminDashboard() {
  const chartRef = useRef(null);
  const navigate = useNavigate();
  const [range, setRange] = useState("30d");
  const [isZoomed, setIsZoomed] = useState(false);
  const { authUser } = useAuth();

  /* ---------------- FETCH DASHBOARD ---------------- */
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard", range],
    queryFn: () => fetchAdminDashboard(range),

    // ✅ THIS FIXES YOUR ERROR
    enabled: !!authUser,

    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
    retry: false,
  });

  const handleResetZoom = () => {
    const chart = chartRef.current;
    if (!chart) return;

    try {
      chart.resetZoom();
    } catch (err) {
      console.error("Reset zoom failed:", err);
    }
  };

  useEffect(() => {
    if (isError) toast.error("Failed to load dashboard");
  }, [isError]);

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl">
        Failed to load admin dashboard.
      </div>
    );
  }

  /* ---------------- KPI CARDS ---------------- */
  const statsData = useMemo(() => {
    if (!data) return {};

    const { leads = {}, alerts = {}, performance = {}, team = {} } = data;

    return {
      leads: [
        {
          label: "Total Leads",
          value: leads.total ?? 0,
          icon: Target,
          iconBg: "bg-indigo-100",
          iconColor: "text-indigo-600",
          onClick: () => navigate("/dashboard/leads/all"),
        },
        {
          label: "Leads Added Today ",
          value: leads.addedToday ?? 0,
          icon: TrendingUp,
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
          onClick: () => navigate("/dashboard/leads/all?filter=today"),
        },
        {
          label: "New Leads",
          value: leads.new ?? 0,
          icon: TrendingUp,
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
        },
        {
          label: "Converted Leads",
          value: leads.converted ?? 0,
          icon: UserCheck,
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          onClick: () => navigate("/dashboard/leads/all?status=converted"),
        },
        {
          label: "Lost Leads",
          value: leads.lost ?? 0,
          icon: UserMinus,
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          onClick: () => navigate("/dashboard/leads/all?status=lost"),
        },
        {
          label: "Pipeline Leads",
          value: leads.pipeline ?? 0,
          icon: Target,
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
        }
      ],

      alerts: [
        {
          label: "Unassigned Leads",
          value: alerts.unassignedLeads ?? 0,
          icon: AlertTriangle,
          iconBg: "bg-orange-100",
          iconColor: "text-orange-600",
          onClick: () => navigate("/dashboard/leads/all?assigned=false"),
        },
        {
          label: "Stale Leads (7 Days)",
          value: alerts.staleLeads ?? 0,
          icon: Clock,
          iconBg: "bg-gray-100",
          iconColor: "text-gray-600",
        },
        {
          label: "Follow-ups Today",
          value: alerts.followUpsToday ?? 0,
          icon: Clock,
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600",
          onClick: () => navigate("/dashboard/leads/all?followup=today"),
        }
      ],

      performance: [
        {
          label: "Conversion Rate (%)",
          value: performance.conversionRate ?? 0,
          icon: Percent,
          iconBg: "bg-blue-100",
          iconColor: "text-blue-700",
        },
        {
          label: "Assignment Rate (%)",
          value: performance.assignmentRate ?? 0,
          icon: UserCheck,
          iconBg: "bg-indigo-100",
          iconColor: "text-indigo-600",
        }
      ],

      team: [
        {
          label: "Partners",
          value: team.partners ?? 0,
          icon: Users,
          iconBg: "bg-cyan-100",
          iconColor: "text-cyan-600",
          onClick: () => navigate("/dashboard/users/partners"),
        },
        {
          label: "Team Leaders",
          value: team.teamLeaders ?? 0,
          icon: Users,
          iconBg: "bg-purple-100",
          iconColor: "text-purple-600",
          onClick: () => navigate("/dashboard/users/team-leaders"),
        },
        {
          label: "Counselors",
          value: team.counselors ?? 0,
          icon: Users,
          iconBg: "bg-teal-100",
          iconColor: "text-teal-600",
          onClick: () => navigate("/dashboard/users/counselors"),
        },
      ],
    };
  }, [data]);

  /* ---------------- CHART DATA ---------------- */

  const chartConfigs = useMemo(() => {
    if (!data) return null;

    const { leads = {}, team = {} } = data;

    const newLeads = leads.new ?? 0;
    const converted = leads.converted ?? 0;
    const contacted = leads.contacted ?? 0;
    const lost = leads.lost ?? 0;

    const leadData = [
      Number(newLeads) || 0,
      Number(converted) || 0,
      Number(contacted) || 0,
      Number(lost) || 0,
    ];

    const trendLabels = data.trends?.map((d) =>
      new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "2-digit" })
    ) || [];
    const trendValues = data.trends?.map((d) => d.count) || [];

    return {
      trend: {
        labels: trendLabels,
        datasets: [{
          label: "Leads Trend",
          data: trendValues,
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          borderColor: "#6366F1",
          backgroundColor: ["#6366F1"],
          pointRadius: 3,
        }],
      },
      funnel: {
        labels: ["New", "Converted", "Contacted", "Lost"],
        datasets: [
          {
            label: "Lead Funnel",
            data: leadData,
            backgroundColor: [
              LEAD_STATUS_COLORS.new,
              LEAD_STATUS_COLORS.converted,
              LEAD_STATUS_COLORS.contacted,
              LEAD_STATUS_COLORS.lost,
            ],
            borderRadius: 6,
          },
        ],
      },

      status: {
        labels: ["New", "Converted", "Contacted", "Lost"],
        datasets: [
          {
            data: leadData,
            backgroundColor: [
              LEAD_STATUS_COLORS.new,
              LEAD_STATUS_COLORS.converted, // ✅ FIXED
              LEAD_STATUS_COLORS.contacted,
              LEAD_STATUS_COLORS.lost,
            ],
            borderWidth: 0,
            spacing: 0, // small gap → premium UI
            hoverOffset: 8,
          },
        ],
      },

      team: {
        labels: ["Active Partners", "Active Team Leaders", "Active Counselors"],
        datasets: [
          {
            label: "Active Team",
            data: [
              team.activePartners ?? 0,
              team.activeTeamLeaders ?? 0,
              team.activeCounselors ?? 0,
            ],
            backgroundColor: "#6366F1",
            borderRadius: 6,
          },
        ],
      },
    };
  }, [data]);

  /* ---------------- DOUGHNUT OPTIONS ---------------- */

  const statusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 15,
        },
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            // ✅ SAFE ACCESS
            const dataset = Array.isArray(context?.dataset?.data)
              ? context.dataset.data
              : [];

            const total = dataset.reduce((a, b) => a + b, 0);

            const value = context.raw ?? 0;
            const percent = total ? ((value / total) * 100).toFixed(1) : 0;

            return `${context.label}: ${value} (${percent}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex justify-between items-center">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/dashboard" },
            { label: "Admin Dashboard" },
          ]}
        />

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      {/* LEAD METRICS */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600">Lead Metrics</h2>
        <StatsCards items={statsData.leads || []} isLoading={isLoading} skeletonCount={6} />
      </div>

      {/* ALERTS */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600">Alerts</h2>
        <StatsCards items={statsData.alerts || []} isLoading={isLoading} skeletonCount={2} />
      </div>

      {/* PERFORMANCE */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600">Performance</h2>
        <StatsCards items={statsData.performance || []} isLoading={isLoading} skeletonCount={1} />
      </div>

      {/* TEAM */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600">Team</h2>
        <StatsCards items={statsData.team || []} skeletonCount={3} />
      </div>

      {/* Charts */}
      {chartConfigs && (
        <div className="space-y-5">

          {/* -------- Leads Trend (Full Width) -------- */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 h-[320px] flex flex-col shadow-sm hover:shadow-md transition">

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Leads Trend</h3>

              <button
                onClick={() => {
                  handleResetZoom();
                  setIsZoomed(false);
                }}
                disabled={!isZoomed}
                className={`text-[11px] px-2 py-1 rounded-md border transition 
          ${isZoomed
                    ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                    : "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"}`}
              >
                Reset
              </button>
            </div>

            <div className="flex-1">
              <Line
                key={range}
                ref={chartRef}
                data={chartConfigs.trend}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { mode: "index", intersect: false },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { color: "#6B7280", font: { size: 10 } },
                    },
                    y: {
                      min: 0,
                      grid: { color: "#F3F4F6" },
                      ticks: {
                        stepSize: 1, // ✅ force 0,1,2,3...
                        precision: 0, // ✅ remove decimals
                        callback: (v) => v.toString(),
                      },
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: "#111827",
                      padding: 8,
                      titleFont: { size: 11 },
                      bodyFont: { size: 11 },
                    },
                    zoom: {
                      pan: { enabled: true, mode: "x" },
                      zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: "x",
                        onZoomComplete: () => setIsZoomed(true),
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* -------- 3 Column Charts -------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {/* Lead Funnel */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 h-[300px] flex flex-col shadow-sm hover:shadow-md transition">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Lead Funnel</h3>

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
                      },
                    },
                    scales: {
                      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                      y: {
                        min: 0,
                        ticks: {
                          stepSize: 1, // ✅ integers only
                          precision: 0,
                          callback: (v) => v.toString(),
                        },
                        grid: { color: "#F3F4F6" },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 h-[300px] flex flex-col shadow-sm hover:shadow-md transition">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Status Distribution</h3>

              <div className="flex-1">
                {chartConfigs?.status?.datasets?.[0]?.data?.length > 0 && (
                  <Doughnut
                    data={chartConfigs.status}
                    options={{
                      ...statusOptions,
                      plugins: {
                        ...statusOptions.plugins,
                        legend: {
                          position: "bottom",
                          labels: {
                            usePointStyle: true,
                            boxWidth: 6,
                            padding: 12,
                            font: { size: 10 },
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            {/* Team Composition */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 h-[300px] flex flex-col shadow-sm hover:shadow-md transition">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Team Composition</h3>

              <div className="flex-1">
                <Bar
                  data={chartConfigs.team}
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
                      },
                    },
                    scales: {
                      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                      y: {
                        min: 0,
                        ticks: {
                          stepSize: 1, // ✅ integers only
                          precision: 0,
                          callback: (v) => v.toString(),
                        },
                        grid: { color: "#F3F4F6" },
                      },
                    },
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