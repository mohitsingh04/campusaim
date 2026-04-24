import React, { useState, useCallback, useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";

const DESKTOP_QUERY = "(min-width: 1024px)"; // Tailwind lg breakpoint

export default function DashboardLayout({ title, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(() =>
        window.matchMedia(DESKTOP_QUERY).matches
    );

    const toggleSidebar = useCallback(() => {
        setSidebarOpen((prev) => !prev);
    }, []);

    // 🔥 Sync state when viewport crosses lg breakpoint
    useEffect(() => {
        const media = window.matchMedia(DESKTOP_QUERY);

        const handleChange = (e) => {
            // Auto-open on desktop, auto-close on mobile
            setSidebarOpen(e.matches);
        };

        media.addEventListener("change", handleChange);
        return () => media.removeEventListener("change", handleChange);
    }, []);

    return (
        <div className="min-h-screen bg-slate-100 flex selection:bg-blue-100 selection:text-blue-900">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div
                className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ${sidebarOpen ? "lg:pl-64" : "lg:pl-0"
                    }`}
            >
                <Navbar
                    title={title}
                    sidebarOpen={sidebarOpen}
                    toggleSidebar={toggleSidebar}
                />

                <main className="flex-1 relative flex flex-col mb-5">
                    <div className="w-full max-w-[1600px] mx-auto pt-4 px-4 md:pt-6 md:px-6 lg:pt-8 lg:px-8 flex flex-col">
                        <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}