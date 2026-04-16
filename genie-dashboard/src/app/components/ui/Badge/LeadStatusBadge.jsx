import React from "react";
import {
    UserPlus,
    PhoneCall,
    Sparkles,
    BadgeCheck,
    XCircle,
    FileCheck,
} from "lucide-react";

/* ---------------- STATUS META ---------------- */

const STATUS_META = {
    new: {
        label: "New",
        className: "bg-indigo-100 text-indigo-700",
        icon: UserPlus,
    },
    contacted: {
        label: "Contacted",
        className: "bg-blue-100 text-blue-700",
        icon: PhoneCall,
    },
    interested: {
        label: "Interested",
        className: "bg-yellow-100 text-yellow-700",
        icon: Sparkles,
    },
    converted: {
        label: "Converted",
        className: "bg-green-100 text-green-700",
        icon: BadgeCheck,
    },
    lost: {
        label: "Lost",
        className: "bg-red-100 text-red-700",
        icon: XCircle,
    },
    applications_done: {
        label: "Application Done",
        className: "bg-sky-100 text-sky-700",
        icon: FileCheck,
    },
};

/* ---------------- COMPONENT ---------------- */

const LeadStatusBadge = React.memo(({ status = "new", feedback }) => {
    const key = String(status).toLowerCase();
    const meta = STATUS_META[key] || STATUS_META.new;
    const StatusIcon = meta.icon;

    return (
        <div className="flex flex-col gap-1 w-fit">
            {/* Feedback badge */}
            {feedback && (
                <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full ${feedback.color} bg-opacity-10`}
                >
                    <feedback.icon className="w-3.5 h-3.5" />
                    {feedback.label}
                </span>
            )}

            {/* Status badge */}
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full capitalize ${meta.className}`}
            >
                <StatusIcon className="w-3.5 h-3.5" />
                {meta.label}
            </span>
        </div>
    );
});

export default LeadStatusBadge;