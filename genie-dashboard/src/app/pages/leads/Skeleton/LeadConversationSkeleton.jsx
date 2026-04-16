import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function LeadConversationSkeleton() {
    return (
        <div className="space-y-6">
            {/* ================= BREADCRUMBS ================= */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <Skeleton width={180} height={28} className="mb-2" />
                    <Skeleton width={320} height={16} />
                </div>
            </div>

            {/* ================= MAIN CONTAINER ================= */}
            <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* ================= SIDEBAR ================= */}
                <div className="w-full md:w-72 border-r border-gray-200 p-6 space-y-6">
                    {/* Progress */}
                    <div>
                        <Skeleton width={120} height={18} className="mb-3" />
                        <Skeleton height={10} borderRadius={6} />
                    </div>

                    {/* Question List */}
                    <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton circle width={18} height={18} />
                                <Skeleton height={14} width="80%" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= CONVERSATION PANEL ================= */}
                <div className="flex-1 flex flex-col relative">
                    {/* Header */}
                    <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton circle width={42} height={42} />
                            <div>
                                <Skeleton width={140} height={16} className="mb-2" />
                                <Skeleton width={100} height={12} />
                            </div>
                        </div>
                        <Skeleton width={90} height={30} borderRadius={8} />
                    </div>

                    {/* Body */}
                    <div className="flex-1 p-8 flex flex-col items-center justify-center space-y-6">
                        {/* Question */}
                        <Skeleton width={300} height={22} />
                        <Skeleton width={420} height={16} />

                        {/* Options */}
                        <div className="w-full max-w-md space-y-3 mt-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} height={44} borderRadius={10} />
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 mt-6">
                            <Skeleton width={100} height={40} borderRadius={10} />
                            <Skeleton width={100} height={40} borderRadius={10} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}