import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ViewLeadSkeleton() {
    return (
        <div className="space-y-6">
            {/* ================= BREADCRUMBS ================= */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <Skeleton width={180} height={28} className="mb-2" />
                    <Skeleton width={300} height={16} />
                </div>

                <div className="flex gap-2">
                    <Skeleton width={90} height={36} borderRadius={8} />
                    <Skeleton width={90} height={36} borderRadius={8} />
                </div>
            </div>

            {/* ================= LEAD HEADER ================= */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT */}
                    <div className="lg:col-span-2">
                        <div className="flex items-start space-x-4">
                            <Skeleton circle width={64} height={64} />

                            <div className="flex-1 space-y-3">
                                <Skeleton width={220} height={22} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Skeleton height={16} />
                                    <Skeleton height={16} />
                                    <Skeleton height={16} className="md:col-span-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* QUICK ACTION */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <Skeleton width={120} height={16} className="mb-3" />
                        <Skeleton height={40} borderRadius={8} />
                    </div>
                </div>
            </div>

            {/* ================= TABS ================= */}
            <div className="border-b border-gray-200 pb-2 flex space-x-8">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} width={120} height={18} />
                ))}
            </div>

            {/* ================= TAB CONTENT ================= */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <Skeleton height={20} width={200} />
                <Skeleton count={4} height={16} />
                <Skeleton height={16} width="80%" />
            </div>
        </div>
    );
}