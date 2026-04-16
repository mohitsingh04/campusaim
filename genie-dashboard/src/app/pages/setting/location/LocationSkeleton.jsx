import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function LocationSkeleton() {
    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6"><Skeleton width={200} height={20} /></h2>
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Skeleton width={80} />
                        </label>
                        <Skeleton height={40} />
                    </div>

                    {/* Pincode */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Skeleton width={80} />
                        </label>
                        <Skeleton height={40} />
                    </div>

                    {/* Country */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Skeleton width={80} />
                        </label>
                        <Skeleton height={40} />
                    </div>

                    {/* State */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Skeleton width={80} />
                        </label>
                        <Skeleton height={40} />
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Skeleton width={80} />
                        </label>
                        <Skeleton height={40} />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Skeleton width={150} height={48} />
                </div>
            </form>
        </div>
    );
}
