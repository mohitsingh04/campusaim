import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function EditNicheSkeleton() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb + Action */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton width={240} height={18} />
                    <Skeleton width={180} height={14} />
                </div>
                <Skeleton width={140} height={38} borderRadius={6} />
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Title */}
                <Skeleton width={120} height={20} className="mb-6" />

                {/* Grid Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Skeleton width={60} height={14} />
                        <Skeleton height={40} borderRadius={8} />
                    </div>

                    {/* Status Select */}
                    <div className="space-y-2">
                        <Skeleton width={70} height={14} />
                        <Skeleton height={40} borderRadius={8} />
                    </div>
                </div>

                {/* Description */}
                <div className="mt-4 space-y-2">
                    <Skeleton width={90} height={14} />
                    <Skeleton height={90} borderRadius={8} />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end mt-6">
                    <Skeleton width={120} height={38} borderRadius={8} />
                </div>
            </div>
        </div>
    );
}