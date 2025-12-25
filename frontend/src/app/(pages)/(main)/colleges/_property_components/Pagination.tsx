import React from "react";
import { getVisiblePageNumbers } from "../utils/filterUtils";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePageNumbers(currentPage, totalPages);

  return (
    <div className="flex justify-center items-center space-x-1 mt-8 flex-wrap gap-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white text-purple-700 hover:bg-purple-100  hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-700 transition-all duration-200"
      >
        <LuChevronLeft />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === "ellipsis" ? (
            <span className="px-3 py-2 text-gray-500">...</span>
          ) : typeof page === "number" ? (
            <button
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[40px] cursor-pointer ${
                currentPage === page
                  ? "bg-purple-600 text-white shadow-lg transform scale-105"
                  : "bg-purple-100 text-gray-700 hover:bg-purple-200 hover:scale-105"
              }`}
            >
              {page}
            </button>
          ) : (
            <span className="px-3 py-2 text-gray-500">...</span>
          )}
        </React.Fragment>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white text-purple-700 hover:bg-purple-100  hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-700 transition-all duration-200"
      >
        <span className="hidden sm:inline">Next</span>
        <LuChevronRight />
      </button>
    </div>
  );
};

export default Pagination;
