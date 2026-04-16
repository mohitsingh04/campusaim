import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ViewQuestionSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header (Breadcrumb + Actions) */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton width={260} height={18} />
                    <Skeleton width={200} height={14} />
                </div>
                <div className="flex gap-2">
                    <Skeleton width={100} height={36} borderRadius={6} />
                    <Skeleton width={90} height={36} borderRadius={6} />
                </div>
            </div>

            {/* Card */}
            <div className="bg-white border rounded-lg p-6 space-y-6">
                {/* Title Bar */}
                <div className="flex items-center gap-2 border-b pb-4">
                    <Skeleton circle width={20} height={20} />
                    <Skeleton width={150} height={18} />
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <Skeleton width={80} height={14} />
                    <Skeleton width={240} height={16} />
                </div>

                {/* Question Text */}
                <div className="space-y-2">
                    <Skeleton width={120} height={14} />
                    <Skeleton count={2} height={12} />
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <Skeleton width={70} height={14} />
                    <Skeleton width={90} height={16} />
                </div>

                {/* Order */}
                <div className="space-y-2">
                    <Skeleton width={60} height={14} />
                    <Skeleton width={40} height={16} />
                </div>

                {/* Options */}
                <div className="space-y-2">
                    <Skeleton width={80} height={14} />
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between border rounded px-4 py-2 bg-gray-50"
                            >
                                <Skeleton width={140} height={16} />
                                <Skeleton width={120} height={14} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                    <div className="space-y-2">
                        <Skeleton width={90} height={14} />
                        <Skeleton width={180} height={16} />
                    </div>
                    <div className="space-y-2">
                        <Skeleton width={90} height={14} />
                        <Skeleton width={180} height={16} />
                    </div>
                </div>
            </div>
        </div>
    );
}