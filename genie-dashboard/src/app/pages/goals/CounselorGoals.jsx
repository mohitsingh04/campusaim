import React, { useEffect, useMemo, useState, useCallback } from "react";
import { API } from "../../services/API";
import { useAuth } from "../../context/AuthContext";
import { Target, Trophy } from "lucide-react";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import StatsCards from "../../components/common/StatsCards/StatsCards";

const getCompletionMeta = (goal) => {
    const current = Number(goal.currentValue) || 0;
    const target = Number(goal.targetValue) || 0;

    if (current > target) {
        return {
            label: "Exceeded",
            cls: "text-green-700 bg-green-100",
            extra: `+${current - target}`
        };
    }

    return {
        label: "Completed",
        cls: "text-green-600",
        extra: null
    };
};

export default function MyGoals() {
    const { authUser } = useAuth();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ---------------- FETCH ----------------
    const fetchGoals = useCallback(async () => {
        try {
            if (!authUser?._id) return;

            setLoading(true);

            const { data } = await API.get(`/goals/${authUser._id}`);

            setGoals(data?.goals || []);
            setError(null);

        } catch (err) {
            console.error(err);
            setError("Failed to load goals");
        } finally {
            setLoading(false);
        }
    }, [authUser?._id]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    // ---------------- HELPERS ----------------
    const formatGoalType = (type) =>
        type?.replaceAll("_", " ").replace(/\b\w/g, l => l.toUpperCase()) || "Goal";

    const computePercent = (current, target) => {
        if (!target) return 0;
        return Math.min(Math.round((current / target) * 100), 100);
    };

    // ---------------- DERIVED STATE ----------------
    const { activeGoals, completedGoals, upcomingGoals, totalProgress } = useMemo(() => {
        let active = [], completed = [], upcoming = [], total = 0;
        const now = new Date();

        for (const g of goals) {
            if (g.status === "active") active.push(g);

            if (g.status === "completed") completed.push(g);

            if (g.status === "not_started" || new Date(g.startDate) > now) {
                upcoming.push(g);
            }

            total += g.currentValue || 0;
        }

        return {
            activeGoals: active,
            completedGoals: completed,
            upcomingGoals: upcoming,
            totalProgress: total
        };
    }, [goals]);

    // ---------------- STATS ----------------
    const statsData = useMemo(() => [
        {
            label: "Active Goals",
            value: activeGoals.length,
            icon: Target,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            label: "Completed",
            value: completedGoals.length,
            icon: Trophy,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
        },
        // {
        //     label: "Total Progress",
        //     value: totalProgress,
        //     icon: Target,
        //     iconBg: "bg-purple-100",
        //     iconColor: "text-purple-600",
        // },
        {
            label: "Upcoming",
            value: upcomingGoals.length,
            icon: Target,
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600",
        }
    ], [activeGoals.length, completedGoals.length, totalProgress]);

    // ---------------- UI STATES ----------------
    if (loading) {
        return <div className="p-6 text-gray-500">Loading goals...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">{error}</div>;
    }

    // ---------------- UI ----------------
    return (
        <div className="space-y-6">

            <Breadcrumbs items={[
                { label: "Dashboard", to: "/dashboard" },
                { label: "My Goals", active: true }
            ]} />

            <StatsCards items={statsData} isLoading={loading} />

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

                {!goals.length && (
                    <div className="col-span-full text-center text-gray-400">
                        No goals assigned yet
                    </div>
                )}

                {goals.map(goal => {
                    const percent = computePercent(goal.currentValue, goal.targetValue);

                    const progressColor =
                        percent >= 100 ? "bg-green-600" :
                            percent >= 70 ? "bg-purple-600" :
                                percent >= 40 ? "bg-yellow-500" :
                                    "bg-blue-600";

                    return (
                        <div key={goal._id}
                            className="bg-white p-5 rounded-lg shadow hover:shadow-md transition">

                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-gray-800">
                                    {formatGoalType(goal.goalType)}
                                </h3>

                                {goal.status === "completed" && (() => {
                                    const meta = getCompletionMeta(goal);
                                    return (
                                        <span className={`text-xs font-medium px-2 py-1 rounded ${meta.cls}`}>
                                            {meta.label} {meta.extra && `(${meta.extra})`}
                                        </span>
                                    );
                                })()}
                                {goal.status === "not_started" && (
                                    <span className="text-xs text-purple-600 font-medium">
                                        Upcoming
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-gray-500 mb-2">
                                {goal.currentValue}/{goal.targetValue}
                            </p>

                            <div className="w-full bg-gray-200 rounded h-3">
                                <div
                                    className={`${progressColor} h-3 rounded transition-all`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                {percent}% completed
                            </p>

                            <div className="text-xs text-gray-400 mt-3 flex justify-between">
                                <span>{new Date(goal.startDate).toLocaleDateString()}</span>
                                <span>{new Date(goal.endDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}