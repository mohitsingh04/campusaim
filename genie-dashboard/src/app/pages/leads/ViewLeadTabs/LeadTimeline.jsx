import React, { useEffect, useState } from "react";
import { API } from "../../../services/API";
import { Clock, UserPlus, MessageCircle, CheckCircle, XCircle } from "lucide-react";

const EVENT_CONFIG = {
    created: { color: "bg-blue-500", icon: Clock, label: "Created" },
    assigned: { color: "bg-yellow-500", icon: UserPlus, label: "Assigned" },
    conversation: { color: "bg-purple-500", icon: MessageCircle, label: "Conversation" },
    converted: { color: "bg-green-500", icon: CheckCircle, label: "Converted" },
    lost: { color: "bg-red-500", icon: XCircle, label: "Lost" }
};

const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
};

const groupByDate = (events) => {
    const groups = { today: [], yesterday: [], older: [] };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    events.forEach(e => {
        const d = new Date(e.date);
        if (d >= today) groups.today.push(e);
        else if (d >= yesterday) groups.yesterday.push(e);
        else groups.older.push(e);
    });

    return groups;
};

export default function LeadTimeline({ lead }) {
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!lead?._id) return;

        const fetchTimeline = async () => {
            try {
                setLoading(true);
                const res = await API.get(`/leads/timeline/${lead._id}`);
                setTimeline(res?.data?.timeline || []);
            } catch (err) {
                console.error("Failed timeline", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTimeline();
    }, [lead?._id]);

    const grouped = groupByDate(timeline);

    const renderEvents = (events) => (
        <div className="relative pl-8">
            <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-gray-200" />
            <div className="space-y-6">
                {events.map((event, index) => {
                    const config = EVENT_CONFIG[event.type] || {};
                    const Icon = config.icon || Clock;

                    return (
                        <div key={index} className="relative flex gap-4">

                            {/* icon */}
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white z-10 ${config.color || "bg-gray-400"}`}>
                                <Icon size={16} />
                            </div>

                            {/* card */}
                            <div className="flex-1 border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-800">
                                            {event.label}
                                        </span>

                                        <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                                            {config.label || event.type}
                                        </span>
                                    </div>

                                    <span className="text-xs text-gray-500">
                                        {formatDate(event.date)}
                                    </span>
                                </div>

                                {event.description && (
                                    <p className="text-xs text-gray-600 mt-1">
                                        {event.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="bg-white border rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-6">
                Lead Timeline
            </h3>

            {loading ? (
                <div className="text-sm text-gray-500">Loading timeline...</div>
            ) : timeline.length === 0 ? (
                <div className="text-sm text-gray-500">No activity yet</div>
            ) : (
                <div className="space-y-8">
                    {grouped.today.length > 0 && (
                        <div>
                            <div className="text-xs font-semibold text-gray-500 mb-4">TODAY</div>
                            {renderEvents(grouped.today)}
                        </div>
                    )}

                    {grouped.yesterday.length > 0 && (
                        <div>
                            <div className="text-xs font-semibold text-gray-500 mb-4">YESTERDAY</div>
                            {renderEvents(grouped.yesterday)}
                        </div>
                    )}

                    {grouped.older.length > 0 && (
                        <div>
                            <div className="text-xs font-semibold text-gray-500 mb-4">OLDER</div>
                            {renderEvents(grouped.older)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}