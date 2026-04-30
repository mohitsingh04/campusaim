"use client";
import { FilterIcon, XIcon } from "lucide-react";
import React from "react";

const MobileFilters = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: any;
  children: React.ReactNode;
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0  bg-opacity-50 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        aria-label="Close filters"
      ></div>

      <div className="bg-(--primary-bg) fixed inset-y-0 left-0 w-full max-w-full shadow-xl overflow-y-auto transition-transform duration-300 ease-in-out transform translate-x-0">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-semibold flex items-center">
            <FilterIcon className="w-4 h-4 mr-2 text-(--main)" /> Filters
          </span>

          <button onClick={onClose} className="p-2 text-(--main)">
            <span className="sr-only">Close filters</span>
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default MobileFilters;
