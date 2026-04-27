import React, { useEffect, useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { API } from "../../../../services/API";
import StatsCards from "../../../../components/common/StatsCards/StatsCards";
import { Users, Layers, CheckCircle } from "lucide-react";

export default function Analytics({ teamLeaderId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    if (!teamLeaderId) return;

    setLoading(true);
    try {
      const res = await API.get(`/analytics/teamleader/${teamLeaderId}`);

      if (!res?.data?.summary) {
        throw new Error("Invalid analytics response");
      }

      setData(res.data);
    } catch (err) {
      console.error("Analytics error:", err?.response?.data || err.message);
      toast.error("Failed to load analytics");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [teamLeaderId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const summary = data?.summary || {};

  const statsData = useMemo(() => [
    {
      label: "Counselors",
      value: Number(summary.totalCounselors) || 0,
      icon: Users,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      label: "Leads",
      value: Number(summary.totalLeads) || 0,
      icon: Layers,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Converted",
      value: Number(summary.convertedLeads) || 0,
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    }
  ], [summary]);

  return (
    <div className="space-y-6">
      <StatsCards
        items={statsData}
        isLoading={loading}
        skeletonCount={3}
      />
    </div>
  );
}