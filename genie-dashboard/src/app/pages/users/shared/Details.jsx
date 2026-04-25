import React from "react";

export default function Details({ data, role }) {
    function timeAgo(date) {
        const now = new Date();
        const diff = Math.floor((now - new Date(date)) / 1000);
        if (diff < 60) return `${diff} seconds ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    }

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{role} Information</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <p className="mt-1 text-sm text-gray-900">{data?.name || "N/A"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <p className="mt-1 text-sm text-gray-900">{data?.email || "N/A"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                                <p className="mt-1 text-sm text-gray-900">{data?.mobile_no || "N/A"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                                <p className="mt-1 text-sm text-gray-900">{data?.createdAt ? timeAgo(data.createdAt) : "N/A"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Activity</label>
                                <p className="mt-1 text-sm text-gray-900">{data?.updatedAt ? timeAgo(data.updatedAt) : "N/A"}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Bio</label>
                                <p className="mt-1 text-sm text-gray-900">{data?.bio || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}