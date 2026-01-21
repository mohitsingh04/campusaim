"use client";

import { DOTS, usePagination } from "@/hooks/usePagination";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type PaginationProps = {
  totalPages: number;
  currentPage?: number;
  classnames?: string;
};

const Pagination = ({
  totalPages,
  currentPage,
  classnames,
}: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = currentPage || Number(searchParams.get("page") || 1);

  const paginationRange = usePagination({
    currentPage: page,
    totalPages,
    siblingCount: 1,
  });

  // ✅ Scroll AFTER route update
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }, [page]);

  if (page === 0 || totalPages < 2) return null;

  const updatePageInURL = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const onFirst = () => page > 1 && updatePageInURL(1);
  const onLast = () => page < totalPages && updatePageInURL(totalPages);
  const onNext = () => page < totalPages && updatePageInURL(page + 1);
  const onPrevious = () => page > 1 && updatePageInURL(page - 1);

  return (
    <div
      className={`flex rounded-lg justify-center bg-(--primary-bg) items-center mt-auto py-3 shrink-0 gap-1 overflow-x-auto whitespace-nowrap no-scrollbar ${classnames}`}
    >
      {/* First */}
      <button
        onClick={onFirst}
        disabled={page === 1}
        className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-custom border border-(--main) text-(--main) bg-(--main-light) transition-all disabled:opacity-40"
      >
        <LuChevronsLeft className="w-5 h-5" />
      </button>

      {/* Previous */}
      <button
        onClick={onPrevious}
        disabled={page === 1}
        className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-custom border border-(--main) text-(--main) bg-(--main-light) transition-all disabled:opacity-40"
      >
        <LuChevronLeft className="w-5 h-5" />
      </button>

      {/* Numbers */}
      {paginationRange?.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return (
            <span key={index} className="px-3 py-2 text-sm">
              ...
            </span>
          );
        }

        const isActive = pageNumber === page;

        return (
          <button
            key={index}
            onClick={() => updatePageInURL(Number(pageNumber))}
            className={`w-7 h-7 md:w-8 md:h-8 text-sm flex items-center justify-center rounded-custom border transition-all
              ${
                isActive
                  ? "bg-(--main) text-(--main-light) border-(--main) shadow-custom scale-95"
                  : "border-(--main) text-(--main-emphasis) bg-(--main-light) hover:bg-(--main-emphasis) hover:text-(--main-light)"
              }`}
          >
            {pageNumber}
          </button>
        );
      })}

      {/* Next */}
      <button
        onClick={onNext}
        disabled={page === totalPages}
        className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-custom border border-(--main) text-(--main) bg-(--main-light) transition-all disabled:opacity-40"
      >
        <LuChevronRight className="w-5 h-5" />
      </button>

      {/* Last */}
      <button
        onClick={onLast}
        disabled={page === totalPages}
        className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-custom border border-(--main) text-(--main) bg-(--main-light) transition-all disabled:opacity-40"
      >
        <LuChevronsRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
