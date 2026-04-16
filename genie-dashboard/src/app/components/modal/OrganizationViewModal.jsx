import React from "react";
import { X, Building2, Globe, Users, Mail, Phone, Calendar, User } from "lucide-react";

export const OrganizationViewModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{data.organization_name}</h2>
                            <span className="text-sm text-gray-500">Organization Details</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                    <DetailItem icon={Globe} label="Website" value={data.website} isLink />
                    <DetailItem icon={User} label="Created By" value={data?.createdBy?.name} />
                    <DetailItem icon={Mail} label="Contact Email" value={data?.createdBy?.email} />
                    <DetailItem icon={Phone} label="Contact Number" value={data?.createdBy?.contact || "N/A"} />
                    <DetailItem icon={Calendar} label="Created Date" value={new Date(data.createdAt).toLocaleDateString()} />
                    <DetailItem
                        icon={Building2}
                        label="Niche"
                        value={data?.nicheId?.name}
                        customBadge="bg-purple-100 text-purple-700"
                    />
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper sub-component for layout consistency
const DetailItem = ({ icon: Icon, label, value, isLink, customBadge }) => (
    <div className="flex items-start gap-3">
        <div className="mt-1 text-gray-400">
            <Icon size={18} />
        </div>
        <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
            {customBadge ? (
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-sm font-medium ${customBadge}`}>
                    {value || "N/A"}
                </span>
            ) : isLink && value ? (
                <a href={value} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline block truncate max-w-[200px]">
                    {value}
                </a>
            ) : (
                <p className="text-sm font-medium text-gray-700">{value || "N/A"}</p>
            )}
        </div>
    </div>
);