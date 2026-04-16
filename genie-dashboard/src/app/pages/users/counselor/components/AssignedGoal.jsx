import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Target, Trophy, CheckCircle, TrendingUp } from "lucide-react";
import { API } from "../../../../services/API";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const CHART_CONFIGS = [
    {
        key: "applications_done",
        label: "Applications Done",
        totalHex: "#6366f1",
        totalBg: "rgba(99, 102, 241, 0.08)"
    },
    {
        key: "admissions_done",
        label: "Admissions Done",
        totalHex: "#059669",
        totalBg: "rgba(5, 150, 105, 0.08)"
    }
];

const getCompletionMeta = (goal) => {
    const current = Number(goal.currentValue) || 0;
    const target = Number(goal.targetValue) || 0;

    if (current > target) {
        return {
            label: "Exceeded",
            cls: "bg-emerald-100 text-emerald-700 border border-emerald-200",
            extra: `+${current - target}`
        };
    }

    return {
        label: "Achieved",
        cls: "bg-emerald-50 text-emerald-600 border border-emerald-100",
        extra: null
    };
};

export default function AssignedGoal({ counselorId }) {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ---------------- FETCH ----------------
    const fetchGoals = useCallback(async () => {
        if (!counselorId) {
            setError("Counselor ID is required.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const { data } = await API.get(`/goals/${encodeURIComponent(counselorId)}`);
            setGoals(Array.isArray(data?.goals) ? data.goals : []);
        } catch (err) {
            console.error("[AssignedGoal] Fetch Error:", err);
            setError("Failed to load counselor goals. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [counselorId]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    // ---------------- HELPERS ----------------
    const formatGoalType = (type) => {
        if (!type) return "Unknown Goal";
        return type.replaceAll("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const computePercent = (current = 0, target = 0) => {
        if (!target || target <= 0) return 0;
        return Math.max(0, Math.min(Math.round((current / target) * 100), 100));
    };

    const getProgressColor = (percent) => {
        if (percent >= 100) return "bg-emerald-500";
        if (percent >= 70) return "bg-indigo-500";
        return "bg-amber-500";
    };

    const getProgressBadge = (percent) => {
        if (percent >= 100) return { label: "Completed", cls: "bg-emerald-50 text-emerald-600 border border-emerald-100" };
        if (percent >= 70) return { label: "On Track", cls: "bg-indigo-50 text-indigo-600 border border-indigo-100" };
        return { label: "In Progress", cls: "bg-amber-50 text-amber-600 border border-amber-100" };
    };

    // ---------------- DERIVED STATES ----------------
    const { activeGoals, completedGoals, upcomingGoals } = useMemo(() => {
        const now = new Date();

        return {
            activeGoals: goals.filter(g => g.status === "active"),

            completedGoals: goals.filter(g => g.status === "completed"),

            upcomingGoals: goals
                .filter(g =>
                    g.status === "not_started" || new Date(g.startDate) > now
                )
                .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)) // earliest first
        };
    }, [goals]);

    // ---------------- CHART DATA ----------------
    const chartDataSets = useMemo(() => {
        if (!goals.length) return {};

        const formatDate = (d) => {
            const date = new Date(d);
            return date.toISOString().slice(0, 10);
        };

        const todayStr = formatDate(new Date());
        const payload = {};

        CHART_CONFIGS.forEach(config => {
            const today = new Date();

            const goal = goals
                .filter(g =>
                    g.goalType === config.key &&
                    new Date(g.startDate) <= today &&
                    new Date(g.endDate) >= today
                )
                .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
            if (!goal) return;

            const start = new Date(goal.startDate);
            const end = new Date(goal.endDate);
            const target = Number(goal.targetValue) || 0;

            // ✅ SAFE DATE GENERATION (no mutation bug)
            const dates = [];
            let cursor = new Date(start);
            while (cursor <= end) {
                dates.push(formatDate(cursor));
                cursor = new Date(cursor);
                cursor.setDate(cursor.getDate() + 1);
            }

            // ✅ Map logs
            const logMap = {};
            goal.progressLogs.forEach(log => {
                if (!log?.date) return;
                const d = formatDate(log.date);
                logMap[d] = (logMap[d] || 0) + (Number(log.count) || 0);
            });

            // ✅ Ensure SAME LENGTH for all datasets
            let running = 0;

            const daily = [];
            const cumulative = [];
            const targetLine = [];

            const totalDays = Math.max(dates.length - 1, 1);

            dates.forEach((date, index) => {
                if (date > todayStr) {
                    daily.push(null);
                    cumulative.push(null);
                } else {
                    const val = logMap[date] || 0;
                    running += val;
                    daily.push(val);
                    cumulative.push(running);
                }

                targetLine.push((target / totalDays) * index);
            });

            payload[config.key] = {
                maxTarget: target || 1,
                data: {
                    labels: dates,
                    datasets: [
                        {
                            label: "Target",
                            data: targetLine,
                            borderColor: "#94a3b8",
                            borderDash: [6, 4],
                            borderWidth: 2,
                            pointRadius: 0
                        },
                        {
                            label: "Cumulative",
                            data: cumulative,
                            borderColor: "#6366f1",
                            borderWidth: 2.5,
                            tension: 0.3,
                            pointRadius: 0
                        },
                        {
                            label: "Daily",
                            data: daily,
                            borderColor: "#f59e0b",
                            backgroundColor: "rgba(245,158,11,0.15)",
                            borderWidth: 2,
                            tension: 0.3,
                            pointRadius: 0
                        }
                    ]
                }
            };
        });

        return payload;
    }, [goals]);

    // ---------------- CHART OPTIONS ----------------
    const getChartOptions = useCallback((maxTarget) => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: {
                position: "top",
                align: "end",
                labels: {
                    usePointStyle: true,
                    pointStyle: "line",
                    boxWidth: 20,
                    padding: 16,
                    color: "#64748b",
                    font: { family: "Inter, sans-serif", size: 12, weight: "500" }
                }
            },
            tooltip: {
                padding: 12,
                backgroundColor: "#0f172a",
                titleColor: "#f8fafc",
                bodyColor: "#94a3b8",
                cornerRadius: 10,
                borderColor: "rgba(255,255,255,0.08)",
                borderWidth: 1,
                callbacks: {
                    title: (items) => `Date: ${items[0]?.label}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                suggestedMax: maxTarget,
                title: {
                    display: true,
                    text: "Target", // 👈 LEFT LABEL
                    color: "#64748b",
                    font: { size: 12, weight: "600" }
                },
                ticks: {
                    stepSize: 1,
                    precision: 0,
                    color: "#94a3b8",
                    font: { size: 11 }
                },
                grid: { color: "rgba(0,0,0,0.05)", drawBorder: false }
            },
            x: {
                title: {
                    display: true,
                    text: "Day", // 👈 BOTTOM LABEL
                    color: "#64748b",
                    font: { size: 12, weight: "600" }
                },
                grid: { display: false },
                ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 6,
                    color: "#94a3b8",
                    font: { size: 11 },
                    callback: function (value) {
                        return this.getLabelForValue(value)?.slice(5);
                    }
                },
                border: { display: false }
            }
        }
    }), []);

    // ---------------- LOADING / ERROR ----------------
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64 p-8">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-400 animate-pulse">Loading goals...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="m-6 p-4 text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3" role="alert">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-slate-50 min-h-screen">

            {/* ── PERFORMANCE CHARTS ── */}
            {goals.length > 0 && (
                <section className="bg-white border border-slate-200 shadow-sm rounded-lg p-6">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-800 text-base">Performance Overview</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Tracking progress against assigned targets</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-5">
                        {CHART_CONFIGS.map(config => {
                            const chartData = chartDataSets[config.key];
                            if (!chartData) return null;

                            return (
                                <div
                                    key={config.key}
                                    className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                                >
                                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                                        {config.label}
                                    </h3>
                                    <div className="h-64">
                                        <Line
                                            data={chartData.data}
                                            options={getChartOptions(chartData.maxTarget)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── ACTIVE GOALS ── */}
            <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-slate-800 text-base">Current Objectives</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Active goals assigned to this counselor</p>
                        </div>
                    </div>
                    {activeGoals.length > 0 && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                            {activeGoals.length} Active
                        </span>
                    )}
                </div>

                {!activeGoals.length ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                        <Target className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-slate-400 text-sm">No active goals assigned yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeGoals.map((goal) => {
                            const percent = computePercent(goal.currentValue, goal.targetValue);
                            const badge = getProgressBadge(percent);
                            return (
                                <div
                                    key={goal._id}
                                    className="p-4 border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all duration-200 bg-white"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-slate-700">
                                            {formatGoalType(goal.goalType)}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
                                                {badge.label}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono">
                                                {goal.currentValue || 0}
                                                <span className="text-slate-300 mx-1">/</span>
                                                {goal.targetValue || 0}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={`${getProgressColor(percent)} h-full rounded-full transition-all duration-500`}
                                            style={{ width: `${percent}%` }}
                                            role="progressbar"
                                            aria-valuenow={percent}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        />
                                    </div>

                                    {/* Percent label */}
                                    <div className="mt-1.5 text-right">
                                        <span className="text-xs text-slate-400">{percent}% complete</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ── COMPLETED GOALS ── */}
            <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <Trophy className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-slate-800 text-base">Milestones Reached</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Successfully completed objectives</p>
                        </div>
                    </div>
                    {completedGoals.length > 0 && (
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                            {completedGoals.length} Completed
                        </span>
                    )}
                </div>

                {!completedGoals.length ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                        <Trophy className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-slate-400 text-sm">No completions yet. Keep going!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {completedGoals.map((goal) => (
                            <div
                                key={goal._id}
                                className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl hover:border-emerald-200 transition-all duration-200"
                            >
                                <span className="text-sm font-medium text-slate-700">
                                    {formatGoalType(goal.goalType)}
                                </span>
                                {(() => {
                                    const meta = getCompletionMeta(goal);
                                    return (
                                        <span className={`text-sm font-semibold flex items-center gap-1.5 px-2 py-1 rounded-full ${meta.cls}`}>
                                            <CheckCircle className="w-4 h-4" />
                                            {meta.label}
                                            {meta.extra && (
                                                <span className="text-xs font-medium ml-1">
                                                    ({meta.extra})
                                                </span>
                                            )}
                                        </span>
                                    );
                                })()}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── UPCOMING GOALS ── */}
            <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Target className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-slate-800 text-base">Upcoming Goals</h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Goals that will start soon
                            </p>
                        </div>
                    </div>

                    {upcomingGoals.length > 0 && (
                        <span className="text-xs font-medium text-purple-600 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
                            {upcomingGoals.length} Upcoming
                        </span>
                    )}
                </div>

                {!upcomingGoals.length ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                        <Target className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-slate-400 text-sm">No upcoming goals.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {upcomingGoals.map(goal => (
                            <div
                                key={goal._id}
                                className="p-4 border border-slate-100 rounded-xl bg-slate-50"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">
                                        {formatGoalType(goal.goalType)}
                                    </span>

                                    <span className="text-xs text-purple-600 font-medium">
                                        Starts on {new Date(goal.startDate).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="mt-2 text-xs text-slate-400">
                                    Target: {goal.targetValue}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}