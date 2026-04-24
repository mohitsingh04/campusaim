import React from "react";
import { maskEmail } from "../../../../app/utils/maskEmail";
import { maskPhone } from "../../../../app/utils/maskPhone";
import Avatar from "../Avatar/Avatar";

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

/**
 * @param {Object} props
 * @param {Object} props.user   - admin | agent | counselor object
 * @param {string} [props.role] - used only for alt text (Admin / Agent / Counselor)
 */
export default function AvatarCell({ user, role = "User" }) {
    if (!user) return null;

    const isActive = user?.status === "Active";

    return (
        <div className="flex items-center">
            {/* Avatar */}
            <div className="relative w-10 h-10">
                <Avatar
                    name={user?.name}
                    src={user?.profile_image}
                    size={10}
                />
                <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                    title={isActive ? "Active" : "Suspended"}
                />
            </div>

            {/* Meta */}
            <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                    {user.name || "—"}
                </div>

                {user.email && (
                    <div className="text-sm text-gray-500">
                        {maskEmail(user.email)}
                    </div>
                )}

                {(user.contact || user.mobile) && (
                    <div className="text-sm text-gray-500">
                        {maskPhone(user.contact || user.mobile)}
                    </div>
                )}
            </div>
        </div>
    );
}
