import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ProfileSkeleton() {
    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                <Skeleton width={200} height={20} />
            </h2>
            <div className="space-y-6">
                {/* Image & Button */}
                <div className="flex flex-col items-center space-y-3">
                    <Skeleton circle width={80} height={80} />
                    <Skeleton width={120} height={36} />
                </div>

                {/* Grid Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Skeleton width={80} />
                        </label>
                        <Skeleton height={40} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Skeleton width={80} />
                        </label>
                        <Skeleton height={40} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Skeleton width={80} />
                        </label>
                        <Skeleton height={40} />
                    </div>
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Skeleton width={60} />
                    </label>
                    <Skeleton height={100} />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Skeleton width={150} height={48} />
                </div>
            </div>
        </div>
    );
}
