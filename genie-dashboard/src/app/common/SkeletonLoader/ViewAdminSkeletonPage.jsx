import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import DashboardLayout from '../../../layout/DashboardLayout';

const ViewAdminSkeletonPage = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Skeleton height={30} width={200} />
                    <Skeleton height={20} width={300} />
                </div>
                <Skeleton height={40} width={100} />
            </div>

            {/* Admin Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex items-start space-x-4">
                        <Skeleton circle height={64} width={64} />
                        <div className="flex-1 space-y-2">
                            <Skeleton height={24} width={180} />
                            <Skeleton height={16} width={250} />
                            <Skeleton height={16} width={200} />
                            <Skeleton height={16} width={300} />
                            <Skeleton height={32} width={100} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Skeleton height={20} width={100} />
                        <Skeleton height={36} />
                        <Skeleton height={36} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                    <Skeleton height={32} width={80} />
                    <Skeleton height={32} width={80} />
                    <Skeleton height={32} width={80} />
                </div>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <Skeleton height={24} width={180} className="mb-4" />
                    <div className="space-y-4">
                        <Skeleton count={3} height={20} />
                    </div>
                </div>
            </div>

            {/* Activity Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Skeleton height={24} width={180} className="mb-4" />
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                            <Skeleton circle height={32} width={32} />
                            <div className="flex-1 space-y-2">
                                <Skeleton height={16} width={`60%`} />
                                <Skeleton height={14} width={`80%`} />
                                <Skeleton height={14} width={`40%`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notes Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <Skeleton height={24} width={120} />
                    <Skeleton height={36} width={100} />
                </div>
                <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4">
                            <Skeleton height={20} width={160} />
                            <Skeleton height={14} width={`60%`} />
                            <Skeleton height={40} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ViewAdminSkeletonPage;
