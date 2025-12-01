import React from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center space-x-1 mt-8 flex-wrap gap-2">

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white text-purple-700 hover:bg-purple-100  hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-700 transition-all duration-200"
      >
        <LuChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="flex items-center space-x-2">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="px-3 py-2 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[40px] cursor-pointer ${
                  currentPage === page
                    ? "bg-purple-600 text-white shadow-lg transform scale-105"
                    : "bg-purple-100 text-gray-700 hover:bg-purple-200 hover:scale-105"
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white text-purple-700 hover:bg-purple-100  hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-700 transition-all duration-200"
      >
        <span className="hidden sm:inline">Next</span>
        <LuChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination;