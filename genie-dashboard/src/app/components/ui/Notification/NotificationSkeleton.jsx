import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function NotificationSkeleton({ count = 6 }) {
    return (
        <div className="flex flex-col max-h-96">
            {/* List */}
            <div className="overflow-y-auto">
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        className="px-4 py-3 border-b flex items-start justify-between gap-3"
                    >
                        {/* Text */}
                        <div className="flex-1 space-y-2">
                            <Skeleton height={12} width="60%" />
                            <Skeleton height={10} width="90%" />
                        </div>

                        {/* Action icon placeholder */}
                        <Skeleton circle width={16} height={16} />
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="border-t bg-gray-50 text-center py-2">
                <Skeleton height={12} width={140} className="mx-auto" />
            </div>
        </div>
    );
}