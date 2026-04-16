import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function EditLeadSkeleton() {
    return (
        <div className="space-y-6">
            {/* ================= BREADCRUMBS ================= */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <Skeleton width={180} height={28} className="mb-2" />
                    <Skeleton width={260} height={16} />
                </div>

                <Skeleton width={90} height={36} borderRadius={8} />
            </div>

            {/* ================= FORM CARD ================= */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                {/* Title */}
                <Skeleton width={150} height={22} className="mb-6" />

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i}>
                            <Skeleton width={100} height={14} className="mb-2" />
                            <Skeleton height={40} borderRadius={8} />
                        </div>
                    ))}
                </div>

                {/* Address & Location */}
                <div className="mt-8">
                    <Skeleton width={180} height={18} className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i}>
                                <Skeleton width={120} height={14} className="mb-2" />
                                <Skeleton height={40} borderRadius={8} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Academic Details */}
                <div className="mt-8">
                    <Skeleton width={160} height={18} className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i}>
                                <Skeleton width={140} height={14} className="mb-2" />
                                <Skeleton height={40} borderRadius={8} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Course Preferences */}
                <div className="mt-8">
                    <Skeleton width={170} height={18} className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i}>
                                <Skeleton width={150} height={14} className="mb-2" />
                                <Skeleton height={40} borderRadius={8} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end mt-6">
                    <Skeleton width={140} height={42} borderRadius={10} />
                </div>
            </div>
        </div>
    );
}