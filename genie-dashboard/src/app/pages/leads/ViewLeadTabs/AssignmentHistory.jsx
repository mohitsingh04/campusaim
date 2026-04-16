import React from "react";

export default function AssignmentHistory({ leadData }) {
    const timeAgo = (date) => {
        if (!date) return "N/A";

        const diff = Math.floor((Date.now() - new Date(date)) / 1000);

        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <div>
            {leadData?.assignmentHistory?.length ? (
                <ul className="space-y-4">
                    {leadData.assignmentHistory.map((h, idx) => (
                        <li
                            key={h._id || idx}
                            className="border rounded-md p-4 text-sm bg-white"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-medium">
                                        Assigned to{" "}
                                        <span className="font-semibold">
                                            {h?.assignedTo?.name || "Unassigned"}
                                        </span>
                                    </p>

                                    <p className="text-xs text-gray-500 mt-0.5">
                                        By {h?.assignedBy?.name} ({h?.role})
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                        {timeAgo(h?.assignedOn)}
                                    </p>

                                    {idx === 0 && (
                                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                            Latest
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-[11px] text-gray-400 mt-2">
                                {new Date(h.assignedOn).toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500">No assignment history</p>
            )}
        </div>
    );
}
