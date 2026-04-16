import React, { useMemo } from "react";

export default function FollowUpAlert({ dateRaw, timeRaw, isClosed }) {

    const followUp = useMemo(() => {
        if (isClosed) return null;

        try {
            // ✅ Normalize DATE (safe)
            const dateObj = new Date(dateRaw);
            if (isNaN(dateObj.getTime())) return null;

            // ✅ Normalize TIME
            let hours = 0;
            let minutes = 0;

            if (timeRaw && typeof timeRaw === "string") {
                const cleanTime = timeRaw.includes("-")
                    ? timeRaw.split("-")[0]
                    : timeRaw;

                const [h, m] = cleanTime.split(":");
                hours = Number(h) || 0;
                minutes = Number(m) || 0;
            }

            // ✅ Construct final datetime safely
            const finalDate = new Date(dateObj);
            finalDate.setHours(hours, minutes, 0, 0);

            // ✅ Normalize today (ignore seconds)
            const now = new Date();

            return {
                date: finalDate,
                isOverdue: finalDate < now,
            };

        } catch (err) {
            console.error("FollowUp parse error:", err);
            return null;
        }

    }, [dateRaw, timeRaw]);

    const format = (d) =>
        new Intl.DateTimeFormat("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(d);

    if (!followUp) return null;

    return (
        <div
            className={`rounded-lg border p-4 flex items-center justify-between ${followUp.isOverdue
                    ? "bg-red-50 border-red-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
        >
            <div>
                <p
                    className={`font-semibold ${followUp.isOverdue
                            ? "text-red-700"
                            : "text-yellow-700"
                        }`}
                >
                    {followUp.isOverdue
                        ? "⚠️ Follow-up Overdue"
                        : "⏰ Upcoming Follow-up"}
                </p>

                <p className="text-sm text-gray-700 mt-1">
                    {format(followUp.date)}
                </p>
            </div>

            {followUp.isOverdue && (
                <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                    Action Required
                </span>
            )}
        </div>
    );
}