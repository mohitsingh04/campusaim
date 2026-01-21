"use client";

import { FaTh, FaList } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";

interface ResultsHeaderProps {
  totalResults: number;
  currentPage: number;
  itemsPerPage: number;
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  onShowMobileFilters: () => void;
}

const ResultsHeader = ({
  totalResults,
  currentPage,
  itemsPerPage,
  viewMode,
  onViewModeChange,
  onShowMobileFilters,
}: ResultsHeaderProps) => {
  const startItem = totalResults > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalResults);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-6 gap-4 shrink-0">
        <div className="m-0 p-0 flex flex-col justify-center">
          <h1 className="heading font-bold text-(--text-color-emphasis)">
            <span className="text-(--main)">{totalResults}</span> Yoga
            Institutes Found
          </h1>
          {totalResults > 0 && (
            <p className="leading-relaxed m-0">
              Showing{" "}
              <span className="text-(--main)">
                {startItem}-{endItem}
              </span>{" "}
              of <span className="text-(--main)">{totalResults}</span> results
            </p>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 relative">
          <button
            onClick={onShowMobileFilters}
            className="lg:hidden flex items-center px-4 py-1 bg-(--main-light) text-(--main-emphasis) border border-(--main-emphasis) rounded-full text-sm transition-colors"
          >
            <FiFilter className="w-4 h-4 mr-2" /> Filters
          </button>
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 text-sm transition-colors cursor-pointer ${
                viewMode === "grid" ? "text-(--main)" : ""
              }`}
            >
              <FaTh className="w-4 h-4" />
            </button>

            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2  transition-colors cursor-pointer ${
                viewMode === "list" ? "text-(--main)" : ""
              }`}
            >
              <FaList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultsHeader;
