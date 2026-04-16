import React, { useMemo, useState } from "react";
import HoverCard from "../../../components/ui/Hover/HoverCard";
import { maskEmail } from "../../../utils/maskEmail";
import { maskPhone } from "../../../utils/maskPhone";
import LeadStatusBadge from "../../../components/ui/Badge/LeadStatusBadge";

/* -------------------------------------------------- */
/* Utils                                              */
/* -------------------------------------------------- */

const formatTimeAgo = (date) => {
    if (!date) return "No activity";

    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return `${Math.floor(diff / 86400)}d ago`;
};

const safeJoinAddress = (lead) =>
    [lead?.address, lead?.city, lead?.state, lead?.pincode]
        .filter(Boolean)
        .join(", ") || "N/A";

/* -------------------------------------------------- */
/* Component                                          */
/* -------------------------------------------------- */

export default function BasicDetails({ leadData, role }) {
    const lead = leadData || {};
    const [showRaw, setShowRaw] = useState(false);

    const rawEntries = useMemo(() => {
        if (!lead?.rawImport) return [];
        return Object.entries(lead.rawImport);
    }, [lead?.rawImport]);

    /* ---------------- BASIC INFO ---------------- */

    const basicInfo = [
        { label: "Name", value: lead?.name },
        { label: "Email", value: maskEmail(lead?.email) },
        { label: "Contact", value: maskPhone(lead?.contact) },
        { label: "Source", value: lead?.marketing?.source || "N/A" },
        { label: "Last Activity", value: formatTimeAgo(lead?.lastActivity) },
        { label: "Address", value: safeJoinAddress(lead) },
        {
            label: "Created At",
            value: lead?.createdAt ? new Date(lead.createdAt).toLocaleString() : null,
        },
        {
            label: "Updated At",
            value: lead?.updatedAt ? new Date(lead.updatedAt).toLocaleString() : null,
        },
    ];

    const academicInfo = [
        { label: "Qualification", value: lead?.academics?.qualification },
        { label: "Board / University", value: lead?.academics?.boardOrUniversity },
        { label: "Passing Year", value: lead?.academics?.passingYear },
        {
            label: "Percentage",
            value: Number.isFinite(lead?.academics?.percentage)
                ? `${lead.academics.percentage}%`
                : null,
        },
        { label: "Stream", value: lead?.academics?.stream },
    ];

    const courseInfo = [
        { label: "Course Name", value: lead?.preferences?.courseName },
        { label: "Course Type", value: lead?.preferences?.courseType },
        { label: "Specialization", value: lead?.preferences?.specialization },
        { label: "Preferred State", value: lead?.preferences?.preferredState },
        { label: "Preferred City", value: lead?.preferences?.preferredCity },
        { label: "College Type", value: lead?.preferences?.collegeType },
    ];

    // Role helpers
    const isAdmin = role === "admin" || role === "superadmin";
    const isTeamLeader = role === "teamleader";
    const isCounselor = role === "counselor";
    const isPartner = role === "partner";

    return (
        <div className="space-y-6">
            {/* ================= DETAILS ================= */}

            <Section title="Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Lead Owner → Admin + TeamLeader only */}
                    {(isAdmin || isTeamLeader) && (
                        <HoverCard
                            label="Lead Owner"
                            name={lead?.createdBy?.name}
                            email={lead?.createdBy?.email}
                            role={lead?.createdBy?.role}
                        />
                    )}

                    {/* Assigned To → Admin + TeamLeader */}
                    {(isAdmin || isTeamLeader) && (
                        <HoverCard
                            label="Assigned To"
                            name={lead?.assignedTo?.name}
                            email={lead?.assignedTo?.email}
                            role={lead?.assignedTo?.role}
                        />
                    )}

                    {/* Teamleader → Admin + TeamLeader + Counselor */}
                    {(isAdmin || isTeamLeader || isCounselor) && (
                        <HoverCard
                            label="Team Leader"
                            name={lead?.teamleader?.name}
                            role="teamleader"
                        />
                    )}

                    {/* Basic Info with role filtering */}
                    {basicInfo
                        .filter((item) => {

                            // Source visible only to admin + teamleader
                            if (item.label === "Source" && !(isAdmin || isTeamLeader)) return false;

                            // Created/Updated visible only to admin
                            if (
                                (item.label === "Created At" || item.label === "Updated At") &&
                                !isAdmin
                            )
                                return false;

                            // Last activity hidden from partner
                            if (item.label === "Last Activity" && isPartner) return false;

                            return true;
                        })
                        .map((item) => (
                            <Info key={item.label} label={item.label} value={item.value} />
                        ))}

                    {/* STATUS + CONVERSION */}
                    <div className="col-span-1 md:col-span-2 bg-slate-50 border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">

                            {/* Lead Status */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Status:</span>
                                <LeadStatusBadge status={lead?.status} />
                            </div>

                            {/* Converted By → Admin + TeamLeader */}
                            {(lead?.status === "converted" && (isAdmin || isTeamLeader)) && (
                                <HoverCard
                                    label="Converted By"
                                    name={lead?.convertedBy?.name}
                                    email={lead?.convertedBy?.email}
                                    role={lead?.convertedBy?.role}
                                />
                            )}

                            {/* Converted At → Admin only */}
                            {(lead?.status === "converted" && isAdmin) && (
                                <Info
                                    label="Converted At"
                                    value={
                                        lead?.convertedAt
                                            ? new Date(lead.convertedAt).toLocaleString()
                                            : null
                                    }
                                />
                            )}

                        </div>
                    </div>
                </div>
            </Section>

            {/* ================= ACADEMICS ================= */}

            <Section title="Academic Details">
                <GridInfo items={academicInfo} />
            </Section>

            {/* ================= COURSE ================= */}

            <Section title="Course Preferences">
                <GridInfo items={courseInfo} />
            </Section>

            {/* ================= RAW IMPORT ================= */}

            {/* Raw data only visible to admin */}
            {(isAdmin && rawEntries.length > 0) && (
                <Section title="Raw Import Data">

                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setShowRaw((s) => !s)}
                            className="text-sm text-blue-600 font-medium"
                        >
                            {showRaw ? "Hide" : "Show"}
                        </button>
                    </div>

                    {showRaw && <RawTable entries={rawEntries} />}

                </Section>
            )}
        </div>
    );
}

/* -------------------------------------------------- */
/* UI Components                                      */
/* -------------------------------------------------- */

const Section = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        {children}
    </div>
);

const GridInfo = ({ items }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
            <Info key={item.label} label={item.label} value={item.value} />
        ))}
    </div>
);

const Info = ({ label, value }) => {
    const safeValue =
        value === 0 || value === false
            ? value
            : value && String(value).trim() !== ""
                ? value
                : "N/A";

    return (
        <div>
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <p className="text-sm text-gray-900 break-words">{safeValue}</p>
        </div>
    );
};

const RawTable = ({ entries }) => (
    <div className="overflow-auto max-h-80 border rounded-lg">
        <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="text-left px-4 py-2 font-semibold text-gray-700">
                        Column
                    </th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-700">
                        Value
                    </th>
                </tr>
            </thead>

            <tbody>
                {entries.map(([key, value]) => (
                    <tr key={key} className="border-b last:border-none">
                        <td className="px-4 py-2 font-medium text-gray-800 whitespace-nowrap">
                            {key}
                        </td>
                        <td className="px-4 py-2 text-gray-700 break-words">
                            {value ?? "—"}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);