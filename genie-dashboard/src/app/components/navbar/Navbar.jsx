import React, { useEffect, useRef, useState } from "react";
import { Menu, Bell } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import { Link } from "react-router-dom";
import Notification from "../ui/Notification/Notification";
import { API } from "../../services/API";
import Logo from "../../assets/campusaim/logo/campusaim-logo.png";

export default function Navbar({ title, sidebarOpen, toggleSidebar }) {
    const notificationRef = useRef(null);

    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const res = await API.get("/notifications/unread-count");
            setUnreadCount(res.data.unread || 0);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(e.target)
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="h-16 px-4 lg:px-8 flex items-center justify-between">

                {/* LEFT SIDE */}
                <div className="flex items-center gap-4">

                    <button
                        onClick={toggleSidebar}
                        aria-label="Toggle sidebar"
                        className="p-2 -ml-2 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Logo */}
                    <Link
                        to="/dashboard"
                        className={`flex items-center gap-3 ${sidebarOpen ? "lg:hidden" : "flex"
                            }`}
                    >
                        <img
                            src={Logo}
                            alt="Campusaim Logo"
                            className="h-10 w-auto object-contain"
                        />
                    </Link>

                    {title && (
                        <h1 className="hidden lg:block text-lg font-semibold text-slate-800 border-l border-slate-200 pl-4 ml-2">
                            {title}
                        </h1>
                    )}
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-4">

                    {/* Notification */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications((prev) => !prev)}
                            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                        >
                            <Bell className="h-5 w-5" />

                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg border border-gray-200 rounded-lg z-50">
                                <Notification
                                    onClose={() => setShowNotifications(false)}
                                    refreshUnread={fetchUnreadCount}
                                />
                            </div>
                        )}
                    </div>

                    {/* Profile */}
                    <ProfileDropdown />

                </div>
            </div>
        </header >
    );
}