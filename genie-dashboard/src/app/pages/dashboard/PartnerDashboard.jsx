import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CalendarDays, Percent, Target, UserCheck, UserMinus } from "lucide-react";

import { fetchPartnerDashboard } from "../../services/queries/dashboardQuery";

import ReferralLinkCard from "../../components/cards/ReferralLinkCard";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import { Link } from "react-router-dom";
import StatsCards from "../../components/common/StatsCards/StatsCards";

// Define outside to prevent re-renders
const RANGES = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

export default function PartnerDashboard() {
  const [range, setRange] = useState("30d");

  /* ---------------- FETCH DASHBOARD ---------------- */
  const { data, isLoading, isError } = useQuery({
    queryKey: ["partner-dashboard", range],
    queryFn: () => fetchPartnerDashboard(range),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });

  if (isError) {
    toast.error("Failed to load dashboard");
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
        <h2 className="font-semibold">Failed to load dashboard data.</h2>
        <p className="text-sm">Please try refreshing the page.</p>
      </div>
    );
  }

  /* ---------------- SAFE DATA EXTRACTION ---------------- */
  const {
    stats = {},
    recentLeads = [],
    analytics = {}
  } = data || {};

  const monthlyTrend = analytics.monthlyTrend || [];
  const topCities = analytics.topCities || [];
  const activeMonths = useMemo(() => monthlyTrend.length, [monthlyTrend]);

  /* ================= STATS ================= */
  const statsData = useMemo(() => [
    { label: "Total Referred Leads", value: stats.totalLeads ?? 0, icon: Target, iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
    { label: "Converted Leads", value: stats.convertedLeads ?? 0, icon: UserCheck, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { label: "Lost Leads", value: stats.lostLeads ?? 0, icon: UserMinus, iconBg: "bg-red-100", iconColor: "text-red-600" },
    { label: "Conversion Rate", value: stats.conversionRate ?? 0, icon: Percent, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  ], [data]);

  return (
    <div className="space-y-6">
      {/* HEADER TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Breadcrumbs items={[{ label: "Home", to: "/dashboard" }, { label: "Partner Dashboard" }]} />

        {/* DATE RANGE SELECTOR */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm w-full md:w-auto">
          <CalendarDays size={18} className="text-gray-500" />
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-transparent text-sm text-gray-700 focus:outline-none cursor-pointer w-full"
          >
            {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {/* KPI CARDS */}
      <StatsCards items={statsData} isLoading={isLoading} skeletonCount={4} />

      {/* REFERRAL LINK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <ReferralLinkCard />
        </div>
      </div>

      {/* ANALYTICS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Monthly Leads Trend</h3>
          {monthlyTrend.length === 0 ? (
            <p className="text-sm text-gray-500">No trend data available</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              {monthlyTrend.map((m) => (
                <TrendBox key={m.month} label={m.month} count={m.count} />
              ))}
            </div>
          )}
          <div className="mt-4 text-xs text-gray-500">
            Active Months: {activeMonths}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Top Cities</h3>
          {topCities.length === 0 ? (
            <p className="text-sm text-gray-500">No city data available</p>
          ) : (
            <ul className="space-y-3">
              {topCities.map((c) => (
                <li key={c.city} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-none">
                  <span className="font-medium text-gray-800">{c.city}</span>
                  <span className="text-gray-500 text-xs">{c.count} leads</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* RECENT LEADS TABLE */}
      <div className="bg-white shadow rounded-xl p-5 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">My Recent Leads</h3>
        {recentLeads.length === 0 ? (
          <p className="text-sm text-gray-500">No leads yet</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 text-gray-500">
                <th className="py-2 pr-4 font-medium uppercase tracking-wider text-xs">Lead</th>
                <th className="py-2 pr-4 font-medium uppercase tracking-wider text-xs">Contact</th>
                <th className="py-2 pr-4 font-medium uppercase tracking-wider text-xs">Email</th>
                <th className="py-2 pr-4 font-medium uppercase tracking-wider text-xs">City</th>
                <th className="py-2 pr-4 font-medium uppercase tracking-wider text-xs">Status</th>
                <th className="py-2 pr-4 font-medium uppercase tracking-wider text-xs">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead) => (
                <tr key={lead._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 font-medium text-gray-900">
                    <Link
                      to={`/dashboard/leads/view/${lead._id}?tab=details`}
                      className="hover:underline hover:text-blue-600 transition-colors"
                    >
                      {lead.name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{lead.contact}</td>
                  <td className="py-3 pr-4 text-gray-600">{lead.email}</td>
                  <td className="py-3 pr-4 text-gray-600">{lead.city || "-"}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                      lead.status === 'lost' ? 'bg-red-100 text-red-700' :
                        'bg-indigo-100 text-indigo-700'
                      }`}>
                      {lead.status || "new"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString("en-IN")}
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

function TrendBox({ label, count }) {
  return (
    <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold mt-1 text-gray-900">{count}</p>
    </div>
  );
}