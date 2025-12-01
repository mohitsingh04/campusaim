import React, { useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { Column } from "../../types/types";

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  currentPage: number;
  rowsPerPage: number;
  setCurrentPage: (page: number) => void;
  rowsPerPageOptions?: number[];
  setRowsPerPage?: (rows: number) => void;
  sortColumn?: string | null;
  sortDirection?: "asc" | "desc" | null;
  onSort?: (colKey: string) => void;
}

const classNames = (...classes: string[]) => classes.filter(Boolean).join(" ");

export function Table<T>({
  data,
  columns,
  currentPage,
  rowsPerPage = 10,
  setCurrentPage,
  rowsPerPageOptions = [5, 10, 15, 20],
  setRowsPerPage,
  sortColumn,
  sortDirection,
  onSort,
}: TableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;
    const col = columns.find((c, idx) => {
      const colKey =
        typeof c.value === "string" ? c.value : c.key || String(idx);
      return colKey === sortColumn;
    });
    if (!col) return data;
    const keyToSort =
      (col as any).sortingKey ||
      (typeof col.value === "string" ? col.value : null);
    if (!keyToSort) return data;

    return [...data].sort((a: any, b: any) => {
      const aVal = a[keyToSort];
      const bVal = b[keyToSort];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortColumn, sortDirection, columns]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  return (
    <div className="rounded-xl flex flex-col shadow-sm overflow-hidden">
      {/* Scrollable area */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[var(--yp-primary)] sticky top-0 z-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--yp-muted)] uppercase tracking-wider">
                #
              </th>
              {columns.map((col, idx) => {
                const colKey =
                  typeof col.value === "string"
                    ? col.value
                    : col.key || String(idx);
                const isSorted = sortColumn === colKey;
                return (
                  <th
                    key={idx}
                    onClick={() => onSort?.(colKey)}
                    className="px-6 py-3 text-left text-xs text-nowrap font-medium text-[var(--yp-muted)] uppercase tracking-wider cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {isSorted && (
                        <span>{sortDirection === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="border-t border-b border-[var(--yp-border-primary)]">
            {paginatedData.map((row, idx) => (
              <tr
                key={idx}
                className={classNames(
                  idx % 2 === 0
                    ? "bg-[var(--yp-secondary)]"
                    : "bg-[var(--yp-primary)]",
                  "hover:bg-[var(--yp-tertiary)] transition-colors"
                )}
              >
                <td className="px-6 py-4 whitespace-nowrap text-xs text-[var(--yp-text-secondary)]">
                  {(currentPage - 1) * rowsPerPage + idx + 1}
                </td>
                {columns.map((col, cidx) => (
                  <td
                    key={cidx}
                    className="px-6 py-4 whitespace-nowrap text-xs text-[var(--yp-text-secondary)]"
                  >
                    {typeof col.value === "function"
                      ? col.value(row)
                      : (row[col.value] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}

            {paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-4 text-center text-[var(--yp-muted)]"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 bg-[var(--yp-primary)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-[var(--yp-text-secondary)]">
            Showing {(currentPage - 1) * rowsPerPage + 1} -{" "}
            {Math.min(currentPage * rowsPerPage, data.length)} of {data.length}{" "}
            results
          </div>

          {setRowsPerPage && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              {/* Rows per page */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--yp-text-secondary)]">
                  Rows per page:
                </span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 rounded-md text-xs bg-[var(--yp-secondary)] text-[var(--yp-text-secondary)] focus:outline-none"
                >
                  {rowsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pagination */}
              <div className="inline-flex rounded-md overflow-hidden">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-2 bg-[var(--yp-secondary)] text-[var(--yp-text-secondary)] text-xs hover:bg-[var(--yp-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-2 bg-[var(--yp-secondary)] text-[var(--yp-text-secondary)] text-xs hover:bg-[var(--yp-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers().map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={idx}
                      className="px-3 py-2 bg-[var(--yp-secondary)] text-xs text-[var(--yp-muted)]"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(p as number)}
                      className={classNames(
                        "px-3 py-2 text-xs font-medium",
                        currentPage === p
                          ? "bg-[var(--yp-main-subtle)] text-[var(--yp-main)]"
                          : "bg-[var(--yp-secondary)] text-[var(--yp-muted)] hover:bg-[var(--yp-tertiary)]"
                      )}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-2 py-2 bg-[var(--yp-secondary)] text-[var(--yp-text-secondary)] text-xs hover:bg-[var(--yp-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-2 bg-[var(--yp-secondary)] text-[var(--yp-text-secondary)] text-xs hover:bg-[var(--yp-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
