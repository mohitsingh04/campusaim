import React, { useEffect, useState } from "react";
import { API } from "../../../services/API";
import { User, MessageSquare, Star, Clock, ShieldAlert } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

// 1. Performance: Cache the formatter outside the render cycle
const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "numeric"
});

const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
        return dateFormatter.format(new Date(dateString));
    } catch {
        return "Invalid Date";
    }
};

export default function ConversationHistory({ leadId }) {
    const { authUser } = useAuth();
    const [state, setState] = useState({
        status: "loading", // 'idle' | 'loading' | 'success' | 'error' | 'empty'
        sessions: [],
        errorMsg: ""
    });

    useEffect(() => {
        if (!leadId) return;

        // 2. Reliability: Prevent memory leaks and race conditions
        const controller = new AbortController();

        const fetchHistory = async () => {
            setState(prev => ({ ...prev, status: "loading", errorMsg: "" }));

            try {
                const res = await API.get(`/lead/conversation/${leadId}`, {
                    signal: controller.signal
                });

                const allSessions = Array.isArray(res?.data?.sessions) ? res.data.sessions : [];

                // Boundary check
                if (allSessions.length === 0) {
                    setState({ status: "empty", sessions: [], errorMsg: "" });
                    return;
                }

                const role = authUser?.role;
                const userId = authUser?._id;

                // 3. Modular filtering logic
                const filtered = (role !== "admin" && userId)
                    ? allSessions.filter(s => String(s?.createdBy?._id) === String(userId))
                    : allSessions;

                setState({
                    status: filtered.length > 0 ? "success" : "empty",
                    sessions: filtered,
                    errorMsg: ""
                });

            } catch (err) {
                if (err.name === "CanceledError" || err.name === "AbortError") return;

                console.error("[ConversationHistory] Fetch error:", err);
                setState({
                    status: "error",
                    sessions: [],
                    errorMsg: err?.response?.status === 404
                        ? "No history found."
                        : "Failed to load conversation history. Please try again."
                });
            }
        };

        fetchHistory();

        return () => controller.abort();
    }, [leadId, authUser]);

    // 4. Clean Early Returns based on state machine
    if (state.status === "loading") return <HistorySkeleton />;

    if (state.status === "error") {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3 text-red-700" role="alert">
                <ShieldAlert className="w-5 h-5" />
                <p className="text-sm font-medium">{state.errorMsg}</p>
            </div>
        );
    }

    if (state.status === "empty") {
        return (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center text-sm text-gray-500">
                No conversation history available for your role.
            </div>
        );
    }

    return (
        <section aria-label="Conversation History" className="space-y-6">
            <header>
                <h3 className="text-lg font-semibold text-gray-900">Conversation History</h3>
            </header>

            <div className="space-y-5">
                {state.sessions.slice().reverse().map((session, index) => {
                    const key = session?._id || `session-${index}`;
                    const counselorConfidence = session?.counselorConfidenceScore ??
                        Math.round(((session?.rating || 0) / 5) * 100);

                    return (
                        <article key={key} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md">

                            <header className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                        <User className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {session?.createdBy?.name || "System Automated"}
                                        </p>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {session?.role || "Counselor"}
                                        </p>
                                    </div>
                                </div>
                                <time dateTime={session?.createdAt} className="text-xs font-medium text-gray-500 flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                                    {formatDateTime(session?.createdAt)}
                                </time>
                            </header>

                            {/* Grid layout for dense data display */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-5">
                                <ScoreBar label="Intent Score" value={session?.overallAnswerScore ?? 0} />
                                <ScoreBar label="System Score" value={session?.systemLeadScore ?? 0} />
                                <ScoreBar label="Counselor Confidence" value={counselorConfidence} />
                                <ScoreBar label="Final Probability" value={session?.overallLeadScore ?? 0} />
                            </div>

                            <footer className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-amber-500" aria-hidden="true" fill="currentColor" />
                                    <span className="text-sm text-gray-700 font-medium">
                                        Session Rating: <span className="text-gray-900 font-bold">{session?.rating ?? 0}/5</span>
                                    </span>
                                </div>

                                {session?.message && (
                                    <div className="flex-1 sm:ml-4 sm:pl-4 sm:border-l border-gray-200">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                                            Counselor Notes
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {session.message}
                                        </p>
                                    </div>
                                )}
                            </footer>

                        </article>
                    );
                })}
            </div>
        </section>
    );
}

// Modular, strictly-typed UI Component
function ScoreBar({ label, value }) {
    const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);

    // Dynamic color coding based on thresholds
    const getColorClass = (val) => {
        if (val >= 80) return "bg-emerald-500";
        if (val >= 50) return "bg-amber-500";
        return "bg-rose-500";
    };

    return (
        <div className="space-y-1.5 flex flex-col justify-center">
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">{label}</span>
                <span className="font-semibold text-gray-900">{safeValue}%</span>
            </div>
            {/* WCAG compliant progress bar */}
            <div
                role="progressbar"
                aria-valuenow={safeValue}
                aria-valuemin="0"
                aria-valuemax="100"
                className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"
            >
                <div
                    className={`h-full rounded-full transition-all duration-500 ${getColorClass(safeValue)}`}
                    style={{ width: `${safeValue}%` }}
                />
            </div>
        </div>
    );
}

// Skeleton loader to prevent Cumulative Layout Shift (CLS)
function HistorySkeleton() {
    return (
        <div className="space-y-6 animate-pulse" aria-hidden="true">
            <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
            {[1, 2].map((i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm h-64">
                    <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
                        <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full" />
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-gray-200 rounded" />
                                <div className="h-3 w-20 bg-gray-100 rounded" />
                            </div>
                        </div>
                        <div className="h-6 w-24 bg-gray-100 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {[1, 2, 3, 4].map(j => (
                            <div key={j} className="space-y-2">
                                <div className="h-4 w-full bg-gray-100 rounded" />
                                <div className="h-2 w-full bg-gray-200 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}