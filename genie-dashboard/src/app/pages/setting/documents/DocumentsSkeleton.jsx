import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function DocumentsSkeleton() {
    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                <Skeleton width={200} height={20} />
            </h2>
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Aadhaar Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Skeleton width={80} />
                        </label>
                        <Skeleton height={40} />
                    </div>

                    {/* PAN Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Skeleton width={80} />
                        </label>
                        <Skeleton height={40} />
                    </div>

                    {/* Aadhaar Front */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Skeleton width={80} />
                        </label>
                        <Skeleton height={110} />
                    </div>

                    {/* Aadhaar Back */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Skeleton width={80} />
                        </label>
                        <Skeleton height={110} />
                    </div>

                    {/* PAN Front */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Skeleton width={80} />
                        </label>
                        <Skeleton height={110} />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Skeleton width={150} height={48} />
                </div>
            </form>
        </div>
    )
}
