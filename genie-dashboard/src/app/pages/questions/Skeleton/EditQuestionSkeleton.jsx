import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function EditQuestionSkeleton() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="space-y-2">
                <Skeleton width={220} height={18} />
                <Skeleton width={140} height={14} />
            </div>

            {/* Card */}
            <div className="bg-white rounded-lg border p-6 space-y-6">
                {/* Heading */}
                <Skeleton width={160} height={22} />

                {/* Title & Question */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Skeleton width={120} height={14} />
                        <Skeleton height={40} borderRadius={6} />
                    </div>

                    <div className="space-y-2">
                        <Skeleton width={140} height={14} />
                        <Skeleton height={40} borderRadius={6} />
                    </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <Skeleton width={120} height={14} />
                    <Skeleton height={40} borderRadius={6} />
                </div>

                {/* Options Section */}
                <div className="border rounded p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <Skeleton width={140} height={18} />
                        <Skeleton width={100} height={16} />
                    </div>

                    {/* Option Rows */}
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                        >
                            <div className="md:col-span-6">
                                <Skeleton height={38} borderRadius={6} />
                            </div>
                            <div className="md:col-span-3">
                                <Skeleton height={38} borderRadius={6} />
                            </div>
                            <div className="md:col-span-2">
                                <Skeleton height={38} borderRadius={6} />
                            </div>
                            <div className="md:col-span-1">
                                <Skeleton width={20} height={20} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Skeleton width={150} height={40} borderRadius={6} />
                </div>
            </div>
        </div>
    );
}