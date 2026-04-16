import React, { useCallback, useEffect, useState, useMemo } from "react";
import { API } from "../../../services/API";
import { useAuth } from "../../../context/AuthContext";

export default function Summary({ leadId }) {
    const { authUser } = useAuth();
    const organizationId = authUser?.organizationId;

    const [questions, setQuestions] = useState([]);
    const [conversation, setConversation] = useState(null);

    const [loadingQuestions, setLoadingQuestions] = useState(true);
    const [loadingConversation, setLoadingConversation] = useState(true);

    const loading = loadingQuestions || loadingConversation;

    /* -------------------------------------------------- */
    /* Fetch Questions (normalize _id → id)               */
    /* -------------------------------------------------- */
    const fetchQuestions = useCallback(async () => {
        if (!organizationId) return;

        try {
            setLoadingQuestions(true);

            const response = await API.get(
                `/questions/organization/${organizationId}`
            );

            const questionList = (response?.data?.data || []).map((q) => ({
                ...q,
                id: String(q._id),
            }));

            setQuestions(questionList);
        } catch (error) {
            console.error(
                error?.response?.data?.message ||
                error?.message ||
                "Error fetching questions"
            );
            setQuestions([]);
        } finally {
            setLoadingQuestions(false);
        }
    }, [organizationId]);

    /* -------------------------------------------------- */
    /* Fetch Conversation                                 */
    /* -------------------------------------------------- */
    const getLeadConversation = useCallback(async () => {
        if (!leadId) return;

        try {
            setLoadingConversation(true);

            const response = await API.get(`/lead/conversation/${leadId}`);
            const sessions = response?.data?.sessions || [];

            if (!sessions.length) {
                setConversation(null);
                return;
            }

            const latestSession = sessions[sessions.length - 1];

            setConversation({
                ...latestSession,
                totalSessions: sessions.length,
            });
        } catch (error) {
            console.error(
                error?.response?.data?.message ||
                error?.message ||
                "Error fetching summary"
            );
            setConversation(null);
        } finally {
            setLoadingConversation(false);
        }
    }, [leadId]);

    useEffect(() => {
        fetchQuestions();
        getLeadConversation();
    }, [fetchQuestions, getLeadConversation]);

    /* -------------------------------------------------- */
    /* Question Map (ObjectId-safe lookup)                */
    /* -------------------------------------------------- */
    const questionMap = useMemo(() => {
        const map = new Map();
        if (!Array.isArray(questions)) return map;

        questions.forEach((q) => {
            map.set(String(q.id ?? q._id), q);
        });

        return map;
    }, [questions]);

    const getQuestionText = (questionId) => {
        return (
            questionMap.get(String(questionId))?.questionText ||
            "Unknown Question"
        );
    };

    const getAnswerLabel = (questionId, answerValue) => {
        const question = questionMap.get(String(questionId));
        const option = question?.options?.find(
            (opt) => opt.value === answerValue
        );

        return option?.label || String(answerValue || "").replaceAll("_", " ");
    };

    /* -------------------------------------------------- */
    /* Guards                                             */
    /* -------------------------------------------------- */
    if (loading) {
        return <div className="p-6 text-gray-500">Loading summary...</div>;
    }

    if (!conversation) {
        return <div className="p-6 text-gray-500">No summary available.</div>;
    }

    /* -------------------------------------------------- */
    /* Render                                             */
    /* -------------------------------------------------- */
    return (
        <div className="grid grid-cols-1 gap-6">
            {/* ================= COUNSELOR NOTE ================= */}
            <div className="bg-white rounded-lg border p-6">
                <h4 className="font-semibold mb-2">Counselor Note</h4>
                <p className="text-gray-700">
                    {conversation.message || "No note added."}
                </p>
            </div>

            {/* ================= QUESTION TABLE ================= */}
            <div className="bg-white rounded-lg border p-6 overflow-x-auto">
                <h4 className="font-semibold mb-4">Conversation Details</h4>

                <table className="w-full text-sm">
                    <thead className="text-left text-gray-500 border-b">
                        <tr>
                            <th className="pb-2">Question</th>
                            <th className="pb-2">Response</th>
                            <th className="pb-2">Analysis</th>
                        </tr>
                    </thead>

                    <tbody>
                        {Array.isArray(conversation?.questions) &&
                            conversation.questions.map((q, index) => (
                                <tr key={index} className="border-b last:border-0">
                                    {/* QUESTION TEXT */}
                                    <td className="py-3 font-medium text-gray-800">
                                        {getQuestionText(q.question_id)}
                                    </td>

                                    {/* ANSWER LABEL */}
                                    <td className="py-3 text-blue-600 font-medium">
                                        {getAnswerLabel(q.question_id, q.answer)}
                                    </td>

                                    {/* SENTIMENT */}
                                    <td className="py-3">
                                        {(() => {
                                            const point = Number(q.point ?? 0);

                                            let label = "Neutral";
                                            let styles = {
                                                backgroundColor: "var(--yp-warning-subtle)",
                                                color: "var(--yp-warning-emphasis)",
                                            };

                                            if (point > 0) {
                                                label = "Positive";
                                                styles = {
                                                    backgroundColor: "var(--yp-success-subtle)",
                                                    color: "var(--yp-success-emphasis)",
                                                };
                                            } else if (point < 0) {
                                                label = "Negative";
                                                styles = {
                                                    backgroundColor: "var(--yp-danger-subtle)",
                                                    color: "var(--yp-danger-emphasis)",
                                                };
                                            }

                                            return (
                                                <span
                                                    className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                                                    style={styles}
                                                >
                                                    {label}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}