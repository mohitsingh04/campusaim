import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function SidebarItem({ item, expandedItem, setExpandedItem }) {
    const location = useLocation();
    const currentPath = location?.pathname || "";
    const isExpanded = expandedItem === item.label;

    const isExactMatch = currentPath === item.path;
    const isPrefixActive = Boolean(item.activePrefix && currentPath.startsWith(item.activePrefix));

    // Truth-based active states
    const isActiveLink = isExactMatch || (!item.subItems && isPrefixActive);
    const hasActiveSubItem = item.subItems?.some(sub => location.pathname.startsWith(sub.path));
    const isParentActive = isExactMatch || isPrefixActive || hasActiveSubItem;

    const handleToggle = (e) => {
        // Prevent navigation if it's just a dropdown toggle
        if (item.subItems) {
            e.preventDefault();
            setExpandedItem(isExpanded ? null : item.label);
        }
    };

    if (item.subItems) {
        return (
            <div className="mb-1">
                <button
                    onClick={handleToggle}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${isParentActive ? "text-blue-700" : "text-slate-600 hover:bg-slate-200/50"}
                        ${isExpanded ? "bg-slate-100 shadow-sm" : ""}`}
                >
                    <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${isParentActive ? "text-blue-600" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 overflow-hidden"}`}>
                    <div className="overflow-hidden">
                        <div className="ml-4 mt-1 pl-4 border-l border-slate-200 space-y-1 py-1">
                            {item.subItems.map((sub) => {
                                const isSubActive = location.pathname.startsWith(sub.path);
                                return (
                                    <Link
                                        key={sub.path}
                                        to={sub.path}
                                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                                            ${isSubActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${isSubActive ? "bg-blue-600" : "bg-slate-300"}`} />
                                        {sub.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActiveLink ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-200/50"}`}
        >
            <item.icon className={`w-5 h-5 ${isActiveLink ? "text-blue-600" : "text-slate-400"}`} />
            {item.label}
        </Link>
    );
}