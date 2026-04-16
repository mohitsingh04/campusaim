import React, { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { API } from "../../../../services/API";
import StatsCards from "../../../../components/common/StatsCards/StatsCards";
import { Layers } from "lucide-react";

export default function Analytics({ counselorId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchAnalytics = useCallback(async () => {
        if (!counselorId) return;

        setLoading(true);
        try {
            const res = await API.get(`/analytics/counselor/${counselorId}`);

            // defensive parsing (avoid undefined crashes)
            if (!res?.data) {
                throw new Error("Invalid analytics response");
            }

            setData(res.data);
        } catch (err) {
            console.error("Analytics error:", err?.response?.data || err.message);
            toast.error("Failed to load analytics");
            setData(null); // reset to safe state
        } finally {
            setLoading(false);
        }
    }, [counselorId]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // safe destructure (prevents crash when data = null)
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
        {
            label: "Conversion %",
            value: summary.conversionRate || 0,
            icon: Layers,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            label: "Contacts",
            value: Number(summary.totalContacts) || 0,
            icon: Layers,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600"
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