import React from "react";
import { Search } from "lucide-react";

export default function SearchFilter({
    value = "",
    onChange,
    placeholder = "Search...",
    className = "",
}) {
    if (typeof onChange !== "function") return null;

    return (
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    );
}
