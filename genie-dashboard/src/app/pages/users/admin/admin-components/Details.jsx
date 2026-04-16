import React, { useMemo } from "react";

/**
 * Utility to calculate relative time. 
 * Moved outside component to prevent re-declaration on every render.
 */
const getTimeAgo = (date) => {
    if (!date) return "N/A";
    const timestamp = new Date(date).getTime();
    if (isNaN(timestamp)) return "N/A";

    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

/**
 * Reusable sub-component for information fields to maintain DRY principle.
 */
const InfoField = ({ label, value, className = "" }) => (
    <div className={className}>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {label}
        </label>
        <p className="mt-1 text-sm font-medium text-gray-900 leading-relaxed">
            {value ?? "N/A"}
        </p>
    </div>
);

export default function Details({ adminData }) {
    // Memoize time calculations so they only update if dates actually change
    const memberSince = useMemo(() => getTimeAgo(adminData?.createdAt), [adminData?.createdAt]);
    const lastActivity = useMemo(() => getTimeAgo(adminData?.updatedAt), [adminData?.updatedAt]);

    return (
        <div className="grid grid-cols-1 gap-6">
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Admin Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Member Since" value={memberSince} />
                    <InfoField label="Last Activity" value={lastActivity} />
                    <InfoField
                        className="md:col-span-2"
                        label="Bio"
                        value={adminData?.bio}
                    />
                </div>
            </section>
        </div>
    );
}