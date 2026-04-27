import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { API, CampusaimAPI } from "../../services/API";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar/Avatar";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { authUser, authLoading } = useAuth();

    const handleLogout = async () => {
        try {
            await CampusaimAPI.get("/profile/logout", {}, { withCredentials: true });
            navigate("/");
        } catch (error) {
            // MANDATORY: Surface errors to the user in production, do not just log.
            console.error("Logout failed:", error);
            alert("Unable to sign out. Please check your connection and try again.");
        } finally {
            setIsOpen(false);
        }
    };

    // Close on outside click & escape key
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleEscapeKey = (event) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
            document.addEventListener("keydown", handleEscapeKey);
        }

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, [isOpen]);

    if (authLoading) {
        return <Skeleton width={122} height={28} />
    }

    const avatarUrl = authUser?.avatar?.[0]
        ? `${import.meta.env.VITE_MEDIA_URL}${authUser.avatar[0]}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser?.name || "User")}&background=0D8ABC&color=fff`;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
            >
                <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border"
                />
                {/* <Avatar
                    name={authUser?.name}
                    src={authUser?.profile_image}
                    size={9}
                /> */}
                <div className="hidden sm:flex items-center gap-2">
                    {/* Text block */}
                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-medium text-slate-700">
                            {authUser?.username || "Guest"}
                        </span>
                        <span className="text-xs text-slate-500">
                            {authUser?.appRole}
                        </span>
                    </div>

                    {/* Icon */}
                    <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 py-1.5 z-50 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    <div className="px-4 py-3 border-b border-slate-100 mb-1 sm:hidden">
                        <p className="text-sm font-medium text-slate-900 truncate">{authUser?.name || "Guest"}</p>
                    </div>

                    <Link
                        to="/dashboard/settings?tab=profile"
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                        <User className="w-4 h-4" />
                        View Profile
                    </Link>

                    <button
                        onClick={handleLogout}
                        role="menuitem"
                        className="w-full flex items-center gap-3 px-4 py-2 mt-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors text-left"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}