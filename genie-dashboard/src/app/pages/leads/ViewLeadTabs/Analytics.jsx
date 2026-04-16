import React, { useEffect, useMemo, useState } from "react";
import { API } from "../../../services/API";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

/* -------------------------------------------------- */
/* ICON CONFIG                                        */
/* -------------------------------------------------- */

const TYPE_CONFIG = {
    positive: {
        icon: CheckCircle,
        className: "bg-green-50 text-green-700 border-green-200",
    },
    negative: {
        icon: AlertCircle,
        className: "bg-red-50 text-red-700 border-red-200",
    },
    neutral: {
        icon: Info,
        className: "bg-gray-50 text-gray-700 border-gray-200",
    },
};

export default function Analytics({ leadId }) {
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(true);

    /* -------------------------------------------------- */
    /* FETCH ANALYTICS                                    */
    /* -------------------------------------------------- */

    useEffect(() => {
        if (!leadId) return;

        const fetchAnalytics = async () => {
            try {
                setLoading(true);

                const res = await API.get(`/lead/conversation/${leadId}`);
                const data = res?.data;

                const sessions = Array.isArray(data?.sessions) ? data.sessions : [];
                const latestSession = data?.latestSession;

                if (!latestSession) {
                    setConversation(null);
                    return;
                }

                const totalSessions = sessions.length || 1;

                const avgRating =
                    sessions.reduce((sum, s) => sum + (Number(s.rating) || 0), 0) /
                    totalSessions;

                const avgLeadScore =
                    sessions.reduce(
                        (sum, s) => sum + (Number(s.overallLeadScore) || 0),
                        0
                    ) / totalSessions;

                setConversation({
                    ...latestSession,
                    explanations: data?.explanations || [],
                    totalSessions,
                    avgRating: Number(avgRating.toFixed(2)),
                    avgLeadScore: Number(avgLeadScore.toFixed(2)),
                });
            } catch (err) {
                console.error("Analytics fetch failed:", err?.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [leadId]);

    /* -------------------------------------------------- */
    /* DERIVED METRICS                                    */
    /* -------------------------------------------------- */

    const { sentimentStats, completionRate } = useMemo(() => {
        if (!conversation) {
            return {
                sentimentStats: { positive: 0, neutral: 0, negative: 0 },
                completionRate: "0 / 0",
            };
        }

        const sentimentStats = (conversation.questions || []).reduce(
            (acc, q) => {
                if (q.point > 0) acc.positive++;
                else if (q.point < 0) acc.negative++;
                else acc.neutral++;
                return acc;
            },
            { positive: 0, neutral: 0, negative: 0 }
        );

        const completionRate = conversation.submitQuestion
            ? `${conversation.submitQuestion.submitted} / ${conversation.submitQuestion.total}`
            : "0 / 0";

        return { sentimentStats, completionRate };
    }, [conversation]);

    /* ---------------- Hybrid Scores ---------------- */

    const probabilityScore = Number(conversation?.overallLeadScore ?? 0);
    const intentScore = Number(conversation?.overallAnswerScore ?? 0);
    const engagementScore = Number(conversation?.systemLeadScore ?? 0);
    const counselorConfidence = Number(
        conversation?.counselorConfidenceScore ?? 0
    );

    if (loading) {
        return <div className="p-6 text-gray-500">Loading analytics...</div>;
    }

    if (!conversation) {
        return <div className="p-6 text-gray-500">No analytics available.</div>;
    }

    const metrics = [
        {
            title: "Admission Probability",
            value: `${probabilityScore}%`,
            className: "text-blue-600",
        },
        {
            title: "Student Intent",
            value: `${intentScore}%`,
            className: "text-green-600",
        },
        {
            title: "System Score",
            value: `${engagementScore}%`,
            className: "text-purple-600",
        },
        {
            title: "Counselor Confidence",
            value: `${counselorConfidence}%`,
            className: "text-amber-600",
        },
        {
            title: "Completion",
            value: completionRate,
            className: "text-gray-900",
        },
    ];

    return (
        <div className="space-y-6">

            {/* ================= METRICS ================= */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {metrics.map((m) => (
                    <MetricCard
                        key={m.title}
                        title={m.title}
                        value={m.value}
                        valueClass={m.className}
                    />
                ))}
            </div>

            {/* ================= SENTIMENT ================= */}
            <div className="bg-white border rounded-lg p-6">
                <h4 className="font-semibold mb-3">Conversation Sentiment</h4>

                <p className="text-sm text-gray-700">
                    {sentimentStats.positive} Positive 🟢 &nbsp;|&nbsp;
                    {sentimentStats.neutral} Neutral 🟡 &nbsp;|&nbsp;
                    {sentimentStats.negative} Negative 🔴
                </p>
            </div>

            {/* ================= EXPLANATIONS ================= */}

            <div className="bg-white border rounded-lg p-6">
                <h4 className="font-semibold mb-4">Why this probability?</h4>

                {conversation.explanations?.length === 0 ? (
                    <p className="text-gray-500 text-sm">No insights available.</p>
                ) : (
                    <ul className="space-y-3 text-sm">
                        {conversation.explanations.map((exp) => {
                            const config = TYPE_CONFIG[exp.type] || TYPE_CONFIG.neutral;
                            const Icon = config.icon;

                            return (
                                <li
                                    key={`${exp.type}-${exp.text}`}
                                    className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${config.className}`}
                                >
                                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{exp.text}</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* ================= META ================= */}

            <div className="bg-white border rounded-lg p-6 text-sm text-gray-600">
                <div className="flex flex-wrap gap-6">
                    <span>
                        Created: {new Date(conversation.createdAt).toLocaleString()}
                    </span>

                    <span>
                        Updated: {new Date(conversation.updatedAt).toLocaleString()}
                    </span>

                    <span>Status: {conversation.status}</span>
                    <span>Sessions: {conversation.totalSessions}</span>
                    <span>Avg Rating: {conversation.avgRating}</span>
                    <span>Avg Probability: {conversation.avgLeadScore}%</span>
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------- */
/* METRIC CARD                                        */
/* -------------------------------------------------- */

function MetricCard({ title, value, valueClass = "text-gray-900" }) {
    return (
        <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase">{title}</p>
            <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
        </div>
    );
}