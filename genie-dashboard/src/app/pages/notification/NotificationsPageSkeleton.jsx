import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function NotificationsPageSkeleton() {
    return (
        <div className="space-y-6">

            {/* Breadcrumb */}
            <div className="space-y-2">
                <Skeleton height={16} width={120} />
                <Skeleton height={12} width={180} />
            </div>

            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Skeleton height={20} width={140} />
                    <Skeleton height={16} width={30} borderRadius={999} />
                </div>
                <Skeleton height={14} width={100} />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <Skeleton height={28} width={80} borderRadius={8} />
                <Skeleton height={28} width={100} borderRadius={8} />
            </div>

            {/* Notification Groups */}
            <div className="space-y-6 max-w-4xl">

                {/* Group */}
                {[1, 2, 3].map((group) => (
                    <div key={group} className="space-y-3">

                        {/* Group Title */}
                        <Skeleton height={12} width={100} />

                        {/* Items */}
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="p-4 border rounded-lg flex justify-between items-start gap-4"
                            >
                                <div className="flex items-start gap-3 flex-1">

                                    {/* Icon */}
                                    <Skeleton circle width={18} height={18} />

                                    {/* Text */}
                                    <div className="space-y-2 w-full">
                                        <Skeleton height={14} width="40%" />
                                        <Skeleton height={12} width="80%" />
                                        <Skeleton height={10} width="30%" />
                                    </div>
                                </div>

                                {/* Action */}
                                <Skeleton height={12} width={70} />
                            </div>
                        ))}
                    </div>
                ))}

            </div>
        </div>
    );
}