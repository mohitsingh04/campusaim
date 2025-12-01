import React from "react";

export interface Column<T> {
  label: string;
  value: keyof T | ((row: T) => React.ReactNode);
}

interface SimpleTableProps<T> {
  data: T[];
  columns: Column<T>[];
}

export function SimpleTable<T>({ data, columns }: SimpleTableProps<T>) {
  return (
    <div className="overflow-x-auto bg-[var(--yp-primary)] rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-[var(--yp-border-primary)]">
        <thead className="bg-[var(--yp-tertiary)]">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-6 py-4 text-left text-sm font-medium text-[var(--yp-muted)] uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-[var(--yp-primary)] divide-y divide-[var(--yp-border-primary)]">
          {data.length > 0 ? (
            data.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-[var(--yp-tertiary)] transition-colors"
              >
                {columns.map((col, cidx) => (
                  <td
                    key={cidx}
                    className="px-6 py-4 text-sm text-[var(--yp-text-secondary)]"
                  >
                    {typeof col.value === "function"
                      ? col.value(row)
                      : (row[col.value] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns?.length}
                className="px-6 py-5 text-center text-[var(--yp-muted)]"
              >
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
