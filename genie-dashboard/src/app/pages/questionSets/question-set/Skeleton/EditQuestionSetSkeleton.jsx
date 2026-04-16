import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function EditQuestionSetSkeleton() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb + Back Button */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton width={260} height={18} />
                    <Skeleton width={200} height={14} />
                </div>
                <Skeleton width={180} height={38} borderRadius={6} />
            </div>

            {/* Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Header */}
                <div className="px-6 py-5 border-b">
                    <Skeleton width={180} height={22} />
                </div>

                {/* Form */}
                <div className="px-6 py-6 space-y-6">
                    {/* Top Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Niche Select */}
                        <div className="space-y-2">
                            <Skeleton width={100} height={14} />
                            <Skeleton height={40} borderRadius={8} />
                        </div>

                        {/* Order */}
                        <div className="space-y-2">
                            <Skeleton width={80} height={14} />
                            <Skeleton height={40} borderRadius={8} />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Skeleton width={90} height={14} />
                            <Skeleton height={40} borderRadius={8} />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Skeleton width={80} height={14} />
                        <Skeleton height={40} borderRadius={8} />
                    </div>

                    {/* Question Text */}
                    <div className="space-y-2">
                        <Skeleton width={120} height={14} />
                        <Skeleton height={70} borderRadius={8} />
                    </div>

                    {/* Options Array */}
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="grid grid-cols-12 gap-3 items-end"
                            >
                                <div className="col-span-3">
                                    <Skeleton height={40} borderRadius={8} />
                                </div>
                                <div className="col-span-3">
                                    <Skeleton height={40} borderRadius={8} />
                                </div>
                                <div className="col-span-2">
                                    <Skeleton height={40} borderRadius={8} />
                                </div>
                                <div className="col-span-3">
                                    <Skeleton height={40} borderRadius={8} />
                                </div>
                                <div className="col-span-1">
                                    <Skeleton width={30} height={36} borderRadius={6} />
                                </div>
                            </div>
                        ))}

                        {/* Add Option Button */}
                        <Skeleton width={140} height={36} borderRadius={6} />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Skeleton width={90} height={36} borderRadius={6} />
                        <Skeleton width={100} height={36} borderRadius={6} />
                    </div>
                </div>
            </div>
        </div>
    );
}