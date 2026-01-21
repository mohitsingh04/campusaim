"use client";

import { useState } from "react";
import { BiSort } from "react-icons/bi";
import { FaTh, FaList } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";

interface ResultsHeaderProps {
  totalResults: number;
  currentPage: number;
  itemsPerPage: number;
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  onShowMobileFilters: () => void;

  sortBy: string;
  onSortChange: (sort: string) => void;
}

const ResultsHeader = ({
  totalResults,
  currentPage,
  itemsPerPage,
  viewMode,
  onViewModeChange,
  onShowMobileFilters,
  sortBy,
  onSortChange,
}: ResultsHeaderProps) => {
  const [openMenu, setOpenMenu] = useState(false);

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

          {/* Grid / List Buttons */}
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

          {/* ⭐ 3 DOT MENU */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu((prev) => !prev)}
              className="px-4 py-1 border border-(--border) text-(--text-color-emphasis) rounded-full text-sm flex items-center"
            >
              <BiSort /> sort
            </button>

            {/* Dropdown Menu */}
            {openMenu && (
              <div className="absolute right-0 mt-2 bg-(--secondary-bg) border border-(--border) shadow-custom rounded-custom w-40 p-2 z-20">
                <button
                  onClick={() => {
                    onSortChange("A-Z");
                    setOpenMenu(false);
                  }}
                  className={`w-full text-left text-sm px-4 py-2 hover:bg-(--main-light) hover:text-(--main-emphasis) border border-transparent hover:border-(--main-emphasis)  rounded-custom ${
                    sortBy === "A-Z"
                      ? "bg-(--main-light) text-(--main-emphasis)"
                      : ""
                  }`}
                >
                  Sort by A-Z
                </button>
                <button
                  onClick={() => {
                    onSortChange("Z-A");
                    setOpenMenu(false);
                  }}
                  className={`w-full text-left text-sm px-4 py-2 hover:bg-(--main-light) hover:text-(--main-emphasis) border border-transparent hover:border-(--main-emphasis)  rounded-custom ${
                    sortBy === "Z-A "
                      ? "bg-(--main-light) text-(--main-emphasis)"
                      : ""
                  }`}
                >
                  Sort by Z-A
                </button>
                {/* <button
                  onClick={() => {
                    onSortChange("rank");
                    setOpenMenu(false);
                  }}
                  className={`w-full text-left text-sm px-4 py-2 hover:bg-(--main-light) hover:text-(--main-emphasis) border border-transparent hover:border-(--main-emphasis)  rounded-custom ${
                    sortBy === "rank"
                      ? "bg-(--main-light) text-(--main-emphasis)"
                      : ""
                  }`}
                >
                  Sort by Rank
                </button> */}

                <button
                  onClick={() => {
                    onSortChange("rating");
                    setOpenMenu(false);
                  }}
                  className={`w-full text-left text-sm px-4 py-2 hover:bg-(--main-light) hover:text-(--main-emphasis) border border-transparent hover:border-(--main-emphasis)  rounded-custom ${
                    sortBy === "rating"
                      ? "bg-(--main-light) text-(--main-emphasis)"
                      : ""
                  }`}
                >
                  Sort by Rating
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultsHeader;
