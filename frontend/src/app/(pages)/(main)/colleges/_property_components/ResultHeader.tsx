import React from "react";
import { LuFilter, LuGrid3X3, LuList } from "react-icons/lu";

interface ResultsHeaderProps {
  totalResults: number;
  currentPage: number;
  itemsPerPage: number;
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  onShowMobileFilters: () => void;
}

const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  totalResults,
  currentPage,
  itemsPerPage,
  viewMode,
  onViewModeChange,
  onShowMobileFilters,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalResults);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-purple-100 gap-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          {totalResults} Colleges Found
        </h1>
        <p className="text-gray-600 text-sm">
          Showing {startItem}-{endItem} of {totalResults} results
        </p>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-4">
        <button
          onClick={onShowMobileFilters}
          className="lg:hidden flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors cursor-pointer"
        >
          <LuFilter className="w-4 h-4 mr-2" />
          Filters
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-purple-100 text-purple-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LuGrid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              viewMode === "list"
                ? "bg-purple-100 text-purple-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LuList className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsHeader;
