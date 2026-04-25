import { Mail, Phone, MapPin } from "lucide-react";
import Avatar from "../../../../components/common/Avatar/Avatar";

export default function AdminProfileCard({ adminData, fullAddress, toggleMutation }) {
    const isActive = adminData?.status === "Active";

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6 transition hover:shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                {/* Avatar */}
                <div className="flex justify-center lg:justify-start">
                    <Avatar
                        name={adminData?.name}
                        src={adminData?.profile_image}
                        size={20}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left space-y-3">

                    {/* Name + Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                            {adminData?.name || "N/A"}
                        </h2>

                        <button
                            onClick={() => adminData?._id && toggleMutation.mutate()}
                            disabled={toggleMutation.isPending}
                            className={`inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold rounded-full text-white transition-all duration-200
              ${isActive ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              ${toggleMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {toggleMutation.isPending
                                ? "Processing..."
                                : isActive
                                    ? "Active"
                                    : "Inactive"}
                        </button>
                    </div>

                    {/* Info Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-600">

                        <div className="flex items-center gap-2 min-w-0">
                            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="truncate">{adminData?.email || "N/A"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>{adminData?.mobile_no || "N/A"}</span>
                        </div>

                        <div className="flex items-start gap-2 sm:col-span-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">
                                {fullAddress || "Address not available"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}