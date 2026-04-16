import React, { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import {
    Users,
    UserCheck,
    Target,
    TrendingUp,
    ChevronRight
} from "lucide-react";
import { API } from "../../../../services/API";
import { useQuery } from "@tanstack/react-query";

/* ---------------- QUERY ---------------- */

const fetchAnalytics = async (adminId) => {
    if (!adminId) throw new Error("Missing adminId");
    const { data } = await API.get(`/admin/${adminId}/analytics`);
    return data;
};

/* ---------------- UI COMPONENTS ---------------- */

const SkeletonLoader = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-gray-100 border border-gray-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 border border-gray-200 rounded-2xl" />
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 border border-gray-200 rounded-2xl" />
            <div className="h-64 bg-gray-100 border border-gray-200 rounded-2xl" />
        </div>
    </div>
);

const MetricItem = ({ label, value, colorClass = "text-gray-900" }) => (
    <li className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 group">
        <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
            {label}
        </span>
        <span className={`text-sm font-semibold ${colorClass}`}>
            {value}
        </span>
    </li>
);

const CardContainer = ({ title, children, icon: Icon }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center gap-2 mb-5">
            {Icon && <Icon className="w-4 h-4 text-gray-400" />}
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {title}
            </h4>
        </div>
        <ul className="divide-y divide-gray-50">
            {children}
        </ul>
    </div>
);

/* ---------------- MAIN COMPONENT ---------------- */

export default function Analytics({ adminId }) {
    const {
        data,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ["admin-analytics", adminId],
        queryFn: () => fetchAnalytics(adminId),
        enabled: Boolean(adminId),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    useEffect(() => {
        if (isError) {
            const message = error?.response?.data?.message || "Failed to load analytics";
            console.error("[Analytics Error]:", error);
            toast.error(message);
        }
    }, [isError, error]);

    const cards = useMemo(() => {
        if (!data?.leads || !data?.people) return [];
        const { people, leads } = data;
        return [
            {
                label: "Total Leads",
                value: leads.total.toLocaleString(),
                icon: Target,
                theme: "blue"
            },
            {
                label: "Conversion Rate",
                value: `${leads.conversionRate}%`,
                icon: TrendingUp,
                theme: "emerald"
            },
            {
                label: "Active Agents",
                value: people.agents.active,
                icon: Users,
                theme: "violet"
            },
            {
                label: "Active Counselors",
                value: people.counselors.active,
                icon: UserCheck,
                theme: "orange"
            }
        ];
    }, [data]);

    const themeMap = {
        blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
        emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100" },
        violet: { bg: "bg-violet-50", icon: "text-violet-600", border: "border-violet-100" },
        orange: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-100" },
    };

    if (isLoading) return <SkeletonLoader />;
    if (!data) return null;

    const { people, leads } = data;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time performance overview and team health.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full self-start">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live Data
                </div>
            </header>

            {/* Top Level Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map(({ label, value, icon: Icon, theme }) => {
                    const style = themeMap[theme];
                    return (
                        <article
                            key={label}
                            className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-gray-300 transition-all duration-300 cursor-default"
                        >
                            <div className="flex justify-between items-start">
                                <div className={`p-3 rounded-xl transition-colors duration-300 ${style.bg}`}>
                                    <Icon className={`w-6 h-6 ${style.icon}`} aria-hidden="true" />
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-transform group-hover:translate-x-1" />
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-500">{label}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{value}</p>
                            </div>
                        </article>
                    );
                })}
            </section>

            {/* Detailed Analytics Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CardContainer title="Leads Overview" icon={Target}>
                    <MetricItem label="Total Leads" value={leads.total.toLocaleString()} />
                    <MetricItem label="New (Last 7 Days)" value={leads.newLast7Days} colorClass="text-emerald-600" />
                    <MetricItem label="Currently Assigned" value={leads.assigned} />
                    <MetricItem label="Waiting Assignment" value={leads.unassigned} colorClass="text-amber-600" />
                    <MetricItem label="Successfully Converted" value={leads.converted} colorClass="text-blue-600" />
                </CardContainer>

                <CardContainer title="Team Health" icon={Users}>
                    <MetricItem
                        label="Agent Availability"
                        value={`${people.agents.active} active / ${people.agents.total}`}
                        colorClass={people.agents.active > 0 ? "text-emerald-600" : "text-gray-900"}
                    />
                    <MetricItem
                        label="Counselor Availability"
                        value={`${people.counselors.active} active / ${people.counselors.total}`}
                        colorClass={people.counselors.active > 0 ? "text-emerald-600" : "text-gray-900"}
                    />
                    <MetricItem label="Inactive Agents" value={people.agents.inactive} colorClass="text-gray-400" />
                    <MetricItem label="Inactive Counselors" value={people.counselors.inactive} colorClass="text-gray-400" />
                </CardContainer>
            </section>
        </div>
    );
}