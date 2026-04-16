import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ViewUserSkeleton() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb + Actions */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton width={220} height={18} />
                    <Skeleton width={160} height={14} />
                </div>
                <div className="flex gap-2">
                    <Skeleton width={90} height={36} borderRadius={6} />
                    <Skeleton width={80} height={36} borderRadius={6} />
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Profile */}
                    <div className="lg:col-span-2">
                        <div className="flex items-start space-x-4">
                            {/* Avatar */}
                            <Skeleton circle width={64} height={64} />

                            {/* Info */}
                            <div className="flex-1 space-y-3">
                                <Skeleton width={180} height={20} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Skeleton width={220} height={14} />
                                    <Skeleton width={180} height={14} />
                                    <Skeleton width={260} height={14} />
                                </div>

                                {/* Status Button */}
                                <Skeleton width={90} height={28} borderRadius={6} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <Skeleton width={120} height={16} />
                            <Skeleton height={36} borderRadius={8} />
                            <Skeleton height={36} borderRadius={8} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                    <Skeleton width={80} height={18} />
                    <Skeleton width={70} height={18} />
                    <Skeleton width={60} height={18} />
                </div>
            </div>

            {/* Analytics Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <Skeleton width={200} height={20} />
                <Skeleton width={260} height={14} />
                <Skeleton width={220} height={14} />

                {/* Table */}
                <div className="space-y-2">
                    <Skeleton width={140} height={16} />
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">
                                        <Skeleton width={60} height={14} />
                                    </th>
                                    <th className="px-4 py-2">
                                        <Skeleton width={60} height={14} />
                                    </th>
                                    <th className="px-4 py-2">
                                        <Skeleton width={120} height={14} />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 3 }).map((_, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-2">
                                            <Skeleton width={80} height={14} />
                                        </td>
                                        <td className="px-4 py-2">
                                            <Skeleton width={60} height={14} />
                                        </td>
                                        <td className="px-4 py-2">
                                            <Skeleton width={70} height={14} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}