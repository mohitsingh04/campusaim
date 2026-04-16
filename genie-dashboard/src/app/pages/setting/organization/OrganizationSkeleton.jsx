import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function OrganizationSkeleton() {
    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6 space-y-2">
                <Skeleton width={260} height={22} />
                <Skeleton width={360} height={16} />
            </div>

            {/* Form */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Niche (react-select mimic) */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            <Skeleton width={60} />
                        </label>
                        <Skeleton height={42} borderRadius={8} />
                    </div>

                    {/* Organization Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            <Skeleton width={140} />
                        </label>
                        <Skeleton height={42} borderRadius={8} />
                    </div>

                    {/* Team Size */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            <Skeleton width={90} />
                        </label>
                        <Skeleton height={42} borderRadius={8} />
                    </div>
                </div>

                {/* Button */}
                <div className="flex justify-end">
                    <Skeleton width={140} height={48} borderRadius={10} />
                </div>
            </div>
        </div>
    );
}