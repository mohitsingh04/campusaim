import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Download, Filter, ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";
import { Table } from "./Table";
import type { Column } from "../../types/types";
import DatePicker from "react-datepicker";
import { generateSlug } from "../../contexts/Callbacks";

export interface TabFilterConfig<T> {
  label: string;
  columns: string[];
  filterField: keyof T;
  options?: string[];
}

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  tabFilters?: TabFilterConfig<T>[];
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  title?: string;
  includeExportFields?: (keyof T)[];
  searchFields?: (keyof T)[];
  searchInput?: boolean;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  tabFilters,
  rowsPerPageOptions = [5, 10, 15, 20],
  defaultRowsPerPage = 10,
  title,
  includeExportFields,
  searchFields,
  searchInput = true,
}: DataTableProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();

  /** ---------------------- STATE INITIALIZATION ---------------------- **/
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page") || 1)
  );
  const [rowsPerPage, setRowsPerPage] = useState(
    Number(searchParams.get("rows") || defaultRowsPerPage)
  );

  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // Sorting
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null
  );

  // Date range
  const [datePickerStartDate, setDatePickerStartDate] = useState<Date | null>(
    searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : null
  );
  const [datePickerEndDate, setDatePickerEndDate] = useState<Date | null>(
    searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : null
  );

  const [appliedStartDate, setAppliedStartDate] = useState<Date | null>(
    datePickerStartDate
  );
  const [appliedEndDate, setAppliedEndDate] = useState<Date | null>(
    datePickerEndDate
  );

  // Filters
  const initialFilters =
    tabFilters?.reduce((acc, f) => {
      const param = searchParams.get(String(f.filterField)) || "";
      acc[String(f.filterField)] = param;
      return acc;
    }, {} as Record<string, string>) || {};

  const [appliedFilters, setAppliedFilters] =
    useState<Record<string, string>>(initialFilters);
  const [tempFilters, setTempFilters] =
    useState<Record<string, string>>(initialFilters);

  /** ---------------------- MERGED URL PARAM UPDATER ---------------------- **/
  const updateSearchParams = (updates: Record<string, string | null>) => {
    const merged = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) merged.delete(key);
      else merged.set(key, value);
    });
    setSearchParams(merged);
  };

  /** ---------------------- SYNC STATE TO URL ---------------------- **/
  useEffect(() => {
    const updates: Record<string, string | null> = {
      search: searchTerm ? generateSlug(searchTerm) : null,
      page: currentPage !== 1 ? String(currentPage) : null,
      rows: rowsPerPage !== defaultRowsPerPage ? String(rowsPerPage) : null,
      startDate: appliedStartDate ? appliedStartDate.toISOString() : null,
      endDate: appliedEndDate ? appliedEndDate.toISOString() : null,
    };

    Object.entries(appliedFilters).forEach(([key, value]) => {
      updates[key] = value || null;
    });

    updateSearchParams(updates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchTerm,
    currentPage,
    rowsPerPage,
    defaultRowsPerPage,
    appliedFilters,
    appliedStartDate,
    appliedEndDate,
  ]);

  /** ---------------------- FILTER HANDLERS ---------------------- **/
  const handleApplyFilters = () => {
    setAppliedFilters({ ...tempFilters });
    setAppliedStartDate(datePickerStartDate);
    setAppliedEndDate(datePickerEndDate);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    const cleared =
      tabFilters?.reduce(
        (acc, f) => ({ ...acc, [String(f.filterField)]: "" }),
        {}
      ) || {};
    setTempFilters(cleared);
    setAppliedFilters(cleared);
    setDatePickerStartDate(null);
    setDatePickerEndDate(null);
    setAppliedStartDate(null);
    setAppliedEndDate(null);
    setCurrentPage(1);
  };

  /** ---------------------- SORTING ---------------------- **/
  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(colKey);
      setSortDirection("asc");
    }
  };

  /** ---------------------- SORTED DATA ---------------------- **/
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    const col = columns.find(
      (c, idx) =>
        (typeof c.value === "string" ? c.value : c.key || String(idx)) ===
        sortColumn
    );
    if (!col) return data;

    const keyToSort =
      (col as any).sortingKey ||
      (typeof col.value === "string" ? col.value : null);
    if (!keyToSort) return data;

    return [...data].sort((a, b) => {
      const valA = a[keyToSort as keyof T];
      const valB = b[keyToSort as keyof T];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      return sortDirection === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [data, sortColumn, sortDirection, columns]);

  /** ---------------------- FILTERED DATA ---------------------- **/
  const filteredData = useMemo(() => {
    const fieldsToSearch =
      searchFields ??
      columns
        .filter((c) => typeof c.value === "string")
        .map((c) => c.value as keyof T);

    return (sortedData?.length > 0 ? sortedData : []).filter((row) => {
      const searchMatch = searchTerm
        ? fieldsToSearch.some((field) => {
            const val = row[field];
            return (
              val &&
              generateSlug(String(val)).includes(generateSlug(searchTerm))
            );
          })
        : true;

      const dynamicMatch = Object.keys(appliedFilters).every((key) => {
        if (!appliedFilters[key]) return true;
        const rowVal = String(row[key as keyof T] ?? "");
        return generateSlug(rowVal) === generateSlug(appliedFilters[key]);
      });

      const dateMatch =
        appliedStartDate || appliedEndDate
          ? (() => {
              const createdAt = row["createdAt" as keyof T];
              if (!createdAt || typeof createdAt !== "string") return false;
              const createdAtDate = new Date(createdAt);
              if (isNaN(createdAtDate.getTime())) return false;

              if (appliedStartDate) {
                const start = new Date(appliedStartDate);
                start.setHours(0, 0, 0, 0);
                if (createdAtDate < start) return false;
              }
              if (appliedEndDate) {
                const end = new Date(appliedEndDate);
                end.setHours(23, 59, 59, 999);
                if (createdAtDate > end) return false;
              }
              return true;
            })()
          : true;

      return searchMatch && dynamicMatch && dateMatch;
    });
  }, [
    sortedData,
    searchTerm,
    appliedFilters,
    appliedStartDate,
    appliedEndDate,
    columns,
    searchFields,
  ]);

  /** ---------------------- EXPORT ---------------------- **/
  const handleExport = (format: "csv" | "excel") => {
    if (!filteredData.length) {
      alert("No data to export.");
      return;
    }

    if (!includeExportFields || !includeExportFields.length) return;

    const keys = includeExportFields.map(String);
    const exportData = filteredData.map((row) => {
      const obj: Record<string, string> = {};
      keys.forEach((k) => {
        obj[k] = String(row[k] ?? "");
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `data.${format === "csv" ? "csv" : "xlsx"}`);
  };

  /** ---------------------- FILTER BAR ---------------------- **/
  const FilterBar = () => (
    <div
      className={`bg-[var(--yp-primary)] rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm ${
        showFilter ? "grid" : "hidden"
      }`}
    >
      {tabFilters?.map((filter) => (
        <div key={String(filter.filterField)} className="flex flex-col">
          <label className="text-sm font-medium text-[var(--yp-text-primary)] mb-1">
            {filter.label}
          </label>
          <select
            value={tempFilters[String(filter.filterField)]}
            onChange={(e) =>
              setTempFilters((prev) => ({
                ...prev,
                [String(filter.filterField)]: generateSlug(e.target.value),
              }))
            }
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          >
            <option value="">All</option>
            {(
              filter.options ||
              Array.from(
                new Set(
                  data.map((item) => String(item[filter.filterField] ?? ""))
                )
              ).filter(Boolean)
            ).map((option) => (
              <option key={option} value={generateSlug(option)}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}

      {/* Date range */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-[var(--yp-text-primary)] mb-1">
          Time Range
        </label>
        <div className="flex gap-2">
          <DatePicker
            selected={datePickerStartDate}
            onChange={(date: Date | null) => setDatePickerStartDate(date)}
            selectsStart
            startDate={datePickerStartDate}
            endDate={datePickerEndDate}
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            dateFormat="dd/MM/yyyy"
            placeholderText="Start Date"
          />
          <DatePicker
            selected={datePickerEndDate}
            onChange={(date: Date | null) => setDatePickerEndDate(date)}
            selectsEnd
            startDate={datePickerStartDate}
            endDate={datePickerEndDate}
            minDate={datePickerStartDate || undefined}
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            dateFormat="dd/MM/yyyy"
            placeholderText="End Date"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 justify-end col-span-1 md:col-span-3">
        <button
          onClick={handleApplyFilters}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
        >
          Apply
        </button>
        <button
          onClick={handleClearFilters}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
        >
          Clear
        </button>
      </div>
    </div>
  );

  /** ---------------------- RENDER ---------------------- **/
  return (
    <div className="space-y-4 relative">
      {title && (
        <h2 className="text-xl font-semibold text-[var(--yp-primary)]">
          {title}
        </h2>
      )}
      {searchInput && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--yp-muted)] w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--yp-primary)] text-[var(--yp-text-primary)] placeholder-[var(--yp-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--yp-main)] shadow-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm bg-[var(--yp-primary)] text-[var(--yp-text-primary)]"
            >
              <Filter className="w-4 h-4 mr-2" /> Filter
            </button>

            {includeExportFields && includeExportFields.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm bg-[var(--yp-primary)] text-[var(--yp-text-primary)]"
                >
                  <Download className="w-4 h-4 mr-2" /> Export
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                {showExportDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-36 bg-[var(--yp-primary)] overflow-hidden rounded-lg z-50 shadow-lg text-[var(--yp-text-primary)]"
                    onMouseLeave={() => setShowExportDropdown(false)}
                  >
                    {["csv", "excel"].map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          handleExport(f as "csv" | "excel");
                          setShowExportDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--yp-secondary)]"
                      >
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <FilterBar />

      <div className="overflow-x-auto rounded-xl shadow-sm">
        <Table
          data={filteredData}
          columns={columns}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          setCurrentPage={setCurrentPage}
          rowsPerPageOptions={rowsPerPageOptions}
          setRowsPerPage={setRowsPerPage}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>
    </div>
  );
}
