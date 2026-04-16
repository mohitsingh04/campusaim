import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function SecuritySkeleton() {
    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                <Skeleton width={200} height={20} />
            </h2>
            <form className="space-y-6">
                <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">
                        <Skeleton width={200} height={20} />
                    </h3>
                    <div className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Skeleton width={200} height={20} />
                            </label>
                            <div className="relative">
                                <Skeleton height={40} />
                            </div>

                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Skeleton width={200} height={20} />
                            </label>
                            <Skeleton height={40} />
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Skeleton width={200} height={20} />
                            </label>
                            <Skeleton height={40} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Skeleton width={150} height={48} />
                </div>
            </form>
        </div>
    )
}
