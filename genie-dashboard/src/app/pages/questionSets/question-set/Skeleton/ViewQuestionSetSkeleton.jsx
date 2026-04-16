import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ViewQuestionSetSkeleton() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb + Actions */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton width={260} height={18} />
                    <Skeleton width={200} height={14} />
                </div>
                <div className="flex gap-2">
                    <Skeleton width={90} height={38} borderRadius={6} />
                    <Skeleton width={170} height={38} borderRadius={6} />
                </div>
            </div>

            {/* Question Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-5 border-b space-y-2">
                    <Skeleton width={180} height={22} />
                    <Skeleton width={260} height={14} />
                </div>

                <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Skeleton width={60} height={14} />
                        <Skeleton width={220} height={18} />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <Skeleton width={50} height={14} />
                        <Skeleton width={180} height={28} borderRadius={6} />
                    </div>

                    {/* Order */}
                    <div className="space-y-2">
                        <Skeleton width={50} height={14} />
                        <Skeleton width={80} height={16} />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Skeleton width={60} height={14} />
                        <Skeleton width={90} height={26} borderRadius={9999} />
                    </div>

                    {/* Question Text */}
                    <div className="md:col-span-2 space-y-2">
                        <Skeleton width={110} height={14} />
                        <Skeleton count={3} height={12} />
                    </div>

                    {/* Niche */}
                    <div className="space-y-2">
                        <Skeleton width={60} height={14} />
                        <Skeleton width={140} height={16} />
                    </div>

                    {/* Created At */}
                    <div className="space-y-2">
                        <Skeleton width={80} height={14} />
                        <Skeleton width={160} height={16} />
                    </div>

                    {/* Updated At */}
                    <div className="space-y-2">
                        <Skeleton width={85} height={14} />
                        <Skeleton width={160} height={16} />
                    </div>
                </div>
            </div>

            {/* Options Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-5 border-b space-y-2">
                    <Skeleton width={120} height={20} />
                    <Skeleton width={260} height={14} />
                </div>

                <div className="px-6 py-6 space-y-3">
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="border rounded-lg p-4 flex justify-between items-center"
                        >
                            <div className="space-y-2">
                                <Skeleton width={160} height={16} />
                                <Skeleton width={200} height={12} />
                            </div>
                            <Skeleton width={70} height={22} borderRadius={9999} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}