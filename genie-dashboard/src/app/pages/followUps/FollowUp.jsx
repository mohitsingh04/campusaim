import React, { useEffect, useMemo, useState } from "react";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import { API } from "../../services/API";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import StatsCards from "../../components/common/StatsCards/StatsCards";
import { Phone, Mail, Clock, Layers, TrendingUp, AlertTriangle, MinusCircle } from "lucide-react";
import LeadStatusBadge from "../../components/ui/Badge/LeadStatusBadge";
import { Link } from "react-router-dom";

const fetchFollowUps = async (type, signal) => {
    try {
        const { data } = await API.get("/follow-ups", {
            params: { type },
            signal, // ✅ cancels previous request
        });
        return data;
    } catch (error) {
        if (error.name === "CanceledError") return; // ignore cancel
        throw new Error(error?.response?.data?.error || "Failed to fetch follow-ups");
    }
};

export default function FollowUp() {
    const [type, setType] = useState("today");

    /* =========================
       FETCH (React Query)
    ========================== */
    const { data, isLoading, isFetching, isError } = useQuery({
        queryKey: ["followUps", type],
        queryFn: ({ signal }) => fetchFollowUps(type, signal),
        staleTime: 0, // 🔥 important
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const followUps = data?.data || [];

    /* =========================
       STATS (optional but useful)
    ========================== */
    const stats = useMemo(() => {
        return {
            total: followUps.length,
            high: followUps.filter((f) => f.score >= 70).length,
            medium: followUps.filter((f) => f.score >= 40 && f.score < 70).length,
            low: followUps.filter((f) => f.score < 40).length,
        };
    }, [followUps]);

    console.log(followUps)

    const statsData = useMemo(() => [
        {
            label: "Total Follow-ups",
            value: stats.total,
            icon: Layers,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            label: "High Priority",
            value: stats.high,
            icon: TrendingUp,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
        },
        {
            label: "Medium Priority",
            value: stats.medium,
            icon: AlertTriangle,
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600",
        },
        {
            label: "Low Priority",
            value: stats.low,
            icon: MinusCircle,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
        },
    ], [stats]);

    useEffect(() => {
        if (isError) {
            toast.error("Failed to load follow-ups");
        }
    }, [isError]);

    {
        isFetching && (
            <p className="text-sm text-blue-500 px-2">Updating...</p>
        )
    }

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Follow Ups", active: true },
                ]}
            />

            {/* =========================
                FILTER TABS
            ========================== */}
            <div className="flex gap-3">
                {["today", "upcoming", "past", "all"].map((t) => (
                    <button
                        key={t}
                        disabled={isFetching}
                        onClick={() => setType(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${type === t
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700"
                            }`}
                    >
                        {t.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* =========================
                STATS
            ========================== */}
            <StatsCards
                items={statsData}
                isLoading={isLoading}
                skeletonCount={4}
            />

            {/* =========================
                LIST
            ========================== */}
            <div className="bg-white rounded-xl shadow divide-y">
                {isLoading ? (
                    <p className="p-4 text-gray-500">Loading...</p>
                ) : followUps.length === 0 ? (
                    <p className="p-4 text-gray-500">No follow-ups found</p>
                ) : (
                    followUps.map((item) => (
                        <div
                            key={item.sessionId}
                            className="p-5 flex justify-between items-start hover:bg-gray-50 transition"
                        >
                            {/* LEFT */}
                            <div className="space-y-2 max-w-[70%]">
                                {/* Name */}
                                <h3 className="font-semibold text-gray-800">
                                    {item.name}
                                </h3>

                                {/* Contact */}
                                <div className="flex gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Phone size={14} />
                                        {item.contact}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Mail size={14} />
                                        {item.email}
                                    </span>
                                </div>

                                {/* Message */}
                                <p className="text-sm text-gray-600">
                                    {item.message}
                                </p>

                                {/* STATUS ROW */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <LeadStatusBadge status={item?.status} />

                                    {item.followUpCompleted && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                            Follow-up Completed
                                        </span>
                                    )}

                                    {!item.followUpCompleted && new Date(item.followUpDate) < new Date() && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                                            Missed
                                        </span>
                                    )}
                                </div>

                                {/* Completed Time */}
                                {item.followUpCompleted && item.followUpCompletedAt && (
                                    <p className="text-xs text-gray-400">
                                        Completed on {new Date(item.followUpCompletedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>

                            {/* RIGHT */}
                            <div className="text-right space-y-2 min-w-[140px]">
                                {/* Date */}
                                <p className="flex items-center justify-end gap-1 text-sm text-gray-500">
                                    <Clock size={14} />
                                    {new Date(item.followUpDate).toLocaleDateString()}
                                </p>

                                {/* Time */}
                                <p className="text-xs text-gray-400">
                                    {item.followUpTime}
                                </p>

                                {/* Priority (DATA) */}
                                <div className="flex justify-end">
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${item.score >= 70
                                            ? "bg-green-100 text-green-600"
                                            : item.score >= 40
                                                ? "bg-yellow-100 text-yellow-600"
                                                : "bg-red-100 text-red-600"
                                            }`}
                                    >
                                        {item.score >= 70
                                            ? "High"
                                            : item.score >= 40
                                                ? "Medium"
                                                : "Low"}
                                    </span>
                                </div>

                                {/* ACTION (separate row) */}
                                <div className="flex justify-end">
                                    <Link
                                        to={`/dashboard/leads/view/${item.leadId}?tab=details`}
                                        className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                                    >
                                        View Lead
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}