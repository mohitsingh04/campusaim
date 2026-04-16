import React from "react";

export function CompactStatsRow({ items = [], isLoading }) {
    if (isLoading) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="min-w-[180px] bg-white border rounded-lg px-4 py-3 animate-pulse"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                            <div className="space-y-2">
                                <div className="h-3 w-24 bg-gray-200 rounded" />
                                <div className="h-4 w-12 bg-gray-300 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-1">
            {items.map((item, i) => {
                const Icon = item.icon;
                return (
                    <div
                        key={i}
                        className="min-w-[200px] bg-white border rounded-lg px-4 py-3 flex items-center gap-3"
                    >
                        <div className={`p-2 rounded-lg ${item.iconBg}`}>
                            {Icon && <Icon className={`w-5 h-5 ${item.iconColor}`} />}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">{item.label}</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {item.value}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}