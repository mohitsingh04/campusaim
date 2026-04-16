import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * @param {number} currentPage
 * @param {number} totalItems
 * @param {number} pageSize
 * @param {Function} onPageChange - (page:number) => void
 * @param {number} siblingCount - pages shown before/after current
 */
export default function Pagination({
    currentPage = 1,
    totalItems = 0,
    pageSize = 10,
    onPageChange,
    siblingCount = 2,
}) {
    if (typeof onPageChange !== "function") return null;

    const totalPages = Math.ceil(totalItems / pageSize);
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const pages = [];
    const addPage = (page) => pages.push(page);
    const addEllipsis = () => pages.push("...");

    if (currentPage > siblingCount + 2) {
        addPage(1);
        addEllipsis();
    }

    const start = Math.max(2, currentPage - siblingCount);
    const end = Math.min(totalPages - 1, currentPage + siblingCount);

    for (let i = start; i <= end; i++) addPage(i);

    if (currentPage < totalPages - siblingCount - 1) {
        addEllipsis();
        addPage(totalPages);
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{startItem}</span> to{" "}
                    <span className="font-medium">{endItem}</span> of{" "}
                    <span className="font-medium">{totalItems}</span> results
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm
                                   text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Prev
                    </button>

                    <div className="flex items-center gap-1">
                        {pages.map((p, idx) =>
                            p === "..." ? (
                                <span key={idx} className="px-2 text-gray-400">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={p}
                                    onClick={() => onPageChange(p)}
                                    className={`px-3 py-1 rounded-md text-sm
                                        ${p === currentPage
                                            ? "bg-blue-600 text-white"
                                            : "border border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    {p}
                                </button>
                            )
                        )}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm
                                   text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Next
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
