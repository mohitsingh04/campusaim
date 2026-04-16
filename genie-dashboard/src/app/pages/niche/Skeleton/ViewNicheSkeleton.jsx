import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ViewNicheSkeleton() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb + Action */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton width={220} height={18} />
                    <Skeleton width={160} height={14} />
                </div>
                <Skeleton width={140} height={38} borderRadius={6} />
            </div>

            {/* Card Container */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Header */}
                <div className="px-6 py-5 border-b space-y-2">
                    <Skeleton width={180} height={22} />
                    <Skeleton width={260} height={14} />
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <Skeleton width={60} height={14} />
                        <Skeleton width={200} height={18} />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <Skeleton width={50} height={14} />
                        <Skeleton width={180} height={28} borderRadius={6} />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Skeleton width={90} height={14} />
                        <Skeleton count={3} height={12} />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Skeleton width={60} height={14} />
                        <Skeleton width={90} height={26} borderRadius={9999} />
                    </div>

                    {/* Meta Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        <div className="space-y-2">
                            <Skeleton width={80} height={14} />
                            <Skeleton width={160} height={16} />
                        </div>

                        <div className="space-y-2">
                            <Skeleton width={90} height={14} />
                            <Skeleton width={140} height={16} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}