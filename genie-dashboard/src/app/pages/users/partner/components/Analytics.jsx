import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { API } from "../../../../services/API";
import StatsCards from "../../../../components/common/StatsCards/StatsCards";
import { Layers } from "lucide-react";

export default function Analytics({ partnerId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/analytics/partner/${partnerId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (partnerId) fetchAnalytics();
  }, [partnerId]);

  const summary = data?.summary || {};

  const statsData = useMemo(() => [
    {
      label: "Total Leads",
      value: Number(summary.totalLeads) || 0,
      icon: Layers,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Converted",
      value: Number(summary.convertedLeads) || 0,
      icon: Layers,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  ], [summary]);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <StatsCards
        items={statsData}
        isLoading={loading}
        skeletonCount={2}
      />
    </div>
  );
}