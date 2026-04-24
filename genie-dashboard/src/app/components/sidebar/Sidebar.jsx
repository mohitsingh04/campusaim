import React, { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { NAVIGATION } from "./navigation.config";
import SidebarItem from "./SidebarItem";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/campusaim/logo/campusaim-logo.png";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { authUser } = useAuth();
    const location = useLocation();
    const [expandedItem, setExpandedItem] = useState(null);

    const items = authUser?.appRole ? NAVIGATION[authUser.appRole] || [] : [];

    // Helper to find which parent should be expanded based on current path
    // Inside Sidebar.jsx
    const getActiveParentLabel = useCallback(() => {
        if (!items || !Array.isArray(items)) return null; // Boundary check

        const currentPath = location?.pathname || "";

        for (const item of items) {
            // 1. Check for dynamic base path matches first
            if (item.activePrefix && currentPath.startsWith(item.activePrefix)) {
                return item.label;
            }

            // 2. Fallback to checking explicit subItem paths
            if (item.subItems && Array.isArray(item.subItems)) {
                const isChildActive = item.subItems.some(sub =>
                    currentPath.startsWith(sub?.path)
                );
                if (isChildActive) return item.label;
            }
        }
        return null;
    }, [items, location.pathname]);

    // Sync expanded state with URL on initial load and route changes
    useEffect(() => {
        const activeLabel = getActiveParentLabel();
        if (activeLabel) {
            setExpandedItem(activeLabel);
        }
    }, [getActiveParentLabel]);

    // Mobile: Auto-close when clicking a link
    useEffect(() => {
        if (window.innerWidth < 1024 && sidebarOpen) {
            setSidebarOpen(false);
        }
    }, [location.pathname]);

    return (
        <>
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 border-r border-slate-200 
                transform transition-transform duration-300 ease-in-out flex flex-col
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 bg-white">

                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <img
                            src={Logo}
                            alt="Campusaim Logo"
                            className="h-10 w-auto object-contain"
                        />
                    </Link>

                    {/* Close Button */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-slate-500 hover:text-slate-700 transition"
                    >
                        <X size={20} />
                    </button>

                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    {items.map((item) => (
                        <SidebarItem
                            key={item.label}
                            item={item}
                            expandedItem={expandedItem}
                            setExpandedItem={setExpandedItem}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-400 font-medium">
                    Campusaim
                </div>
            </aside>
        </>
    );
}