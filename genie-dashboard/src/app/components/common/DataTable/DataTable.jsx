import React from "react";
import DataTableSkeleton from "./DataTableSkeleton";

/**
 * @param {Array} columns - [{ key, label, render?, className? }]
 * @param {Array} data - array of row objects
 * @param {boolean} isLoading
 * @param {Function} rowKey - (row) => unique key
 * @param {Function} onSelectAll
 * @param {Function} onSelectRow
 * @param {Set} selectedRows
 * @param {boolean} selectable
 * @param {ReactNode} emptyState
 */
export default function DataTable({
    columns = [],
    data = [],
    isLoading = false,
    rowKey,
    selectedRows = new Set(),
    onSelectRow,
    onSelectAll,
    selectable = false,
    emptyState = "No data found.",
    showSerial = false,
    startIndex = 0, // useful for pagination (page * limit)
}) {
    const allSelected =
        selectable &&
        data.length > 0 &&
        data.every((row) => selectedRows.has(rowKey(row)));

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {selectable && (
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={onSelectAll}
                                        className="cursor-pointer"
                                    />
                                </th>
                            )}

                            {showSerial && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    #
                                </th>
                            )}

                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ""}`}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {isLoading ? (
                            <DataTableSkeleton
                                columnsCount={columns.length}
                                selectable={selectable}
                                rows={5}
                            />
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0)}
                                    className="py-6 text-center text-gray-500"
                                >
                                    {emptyState}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => {
                                const key = rowKey(row);

                                return (
                                    <tr key={key} className="hover:bg-gray-50">
                                        {selectable && (
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(key)}
                                                    onChange={() => onSelectRow(key)}
                                                    className="cursor-pointer"
                                                />
                                            </td>
                                        )}

                                        {/* ✅ SERIAL NUMBER */}
                                        {showSerial && (
                                            <td className="w-12 px-6 py-4 text-center text-sm text-gray-400">
                                                {startIndex + index + 1}
                                            </td>
                                        )}

                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className={`px-6 py-4 whitespace-nowrap ${col.tdClassName || ""}`}
                                            >
                                                {col.render ? col.render(row) : row[col.key] ?? "—"}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
