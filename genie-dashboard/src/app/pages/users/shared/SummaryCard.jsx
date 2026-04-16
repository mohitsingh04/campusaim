// React 18+, TailwindCSS 3+

import { Mail, MapPin, Phone } from "lucide-react";

export default function SummaryCard({
    data,
    location,
    status,
    loading = false,
    onToggleStatus,
}) {
    const initials =
        data?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

    const address =
        location &&
        [
            location.address,
            location.pincode,
            location.city,
            location.state,
            location.country,
        ]
            .filter(Boolean)
            .join(", ");

    const isActive = status === "active";

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-6 overflow-hidden">

            {/* HEADER */}
            <div className="flex flex-col gap-4">

                {/* TOP ROW */}
                <div className="flex items-start gap-3 sm:items-center sm:justify-between">

                    {/* LEFT */}
                    <div className="flex items-start gap-3 min-w-0">

                        {/* Avatar */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                            {data?.profile_image ? (
                                <img
                                    src={`${import.meta.env.VITE_MEDIA_URL}${data.profile_image_compressed}`}
                                    alt={data?.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-blue-600 font-semibold">
                                    {initials}
                                </span>
                            )}
                        </div>

                        {/* Name + Info */}
                        <div className="min-w-0">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                {data?.name || "N/A"}
                            </h2>

                            {/* INFO */}
                            <div className="flex flex-col gap-1 mt-1 text-sm text-gray-600">

                                <div className="flex items-start gap-2 min-w-0">
                                    <Mail className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                    <span className="truncate break-all">
                                        {data?.email || "N/A"}
                                    </span>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                    <span className="break-all">
                                        {data?.contact || "N/A"}
                                    </span>
                                </div>

                                <div className="flex items-start gap-2 min-w-0">
                                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                    <span className="break-words leading-snug">
                                        {address || "Address not available"}
                                    </span>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* STATUS (DESKTOP) */}
                    {onToggleStatus && (
                        <button
                            onClick={onToggleStatus}
                            disabled={loading}
                            className={`hidden sm:inline-flex px-4 py-1.5 text-xs font-semibold rounded-full text-white whitespace-nowrap
                                ${isActive ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                                ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {loading ? "..." : isActive ? "Active" : "Suspended"}
                        </button>
                    )}
                </div>

                {/* STATUS (MOBILE FULL WIDTH) */}
                {onToggleStatus && (
                    <button
                        onClick={onToggleStatus}
                        disabled={loading}
                        className={`sm:hidden w-full px-4 py-2 text-sm font-semibold rounded-full text-white
                            ${isActive ? "bg-green-600" : "bg-red-600"}
                            ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {loading ? "..." : isActive ? "Active" : "Suspended"}
                    </button>
                )}
            </div>

            {/* LEAD SUMMARY */}
            {data?.role === "counselor" && (
                <div className="mt-5 border-t pt-4">

                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Lead Summary
                    </h3>

                    <div className="grid grid-cols-3 gap-2 sm:gap-4">

                        <div className="bg-gray-50 rounded-lg py-2 sm:py-3 text-center border">
                            <p className="text-base sm:text-lg font-semibold text-gray-900">
                                {data?.stats?.assignedLeads || 0}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500">Assigned</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg py-2 sm:py-3 text-center border">
                            <p className="text-base sm:text-lg font-semibold text-gray-900">
                                {data?.stats?.createdLeads || 0}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500">Created</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg py-2 sm:py-3 text-center border">
                            <p className="text-base sm:text-lg font-semibold text-gray-900">
                                {data?.stats?.totalLeads || 0}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500">Total</p>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}