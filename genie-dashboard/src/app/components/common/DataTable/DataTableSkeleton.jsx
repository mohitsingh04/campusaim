// DataTableSkeleton.jsx
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function DataTableSkeleton({
    columnsCount,
    rows = 5,
    selectable = false,
}) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <tr key={rowIdx} className="animate-pulse">
                    {selectable && (
                        <td className="px-6 py-4">
                            <Skeleton width={14} height={14} borderRadius={4} />
                        </td>
                    )}

                    {Array.from({ length: columnsCount }).map((_, colIdx) => (
                        <td key={colIdx} className="px-6 py-4 whitespace-nowrap">
                            <Skeleton
                                height={14}
                                width={`${65 + Math.random() * 25}%`} // realistic text width variance
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}