"use client";

import HeadingLine from "@/ui/headings/HeadingLine";
import { ChevronDown } from "lucide-react";
import React from "react";

const FilterSection = ({
  title,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: any;
  children: React.ReactNode;
}) => (
  <div className="pb-2">
    <button
      onClick={onToggle}
      className="flex items-center justify-between cursor-pointer w-full text-left font-medium hover:text-(--main) transition-colors sub-heading"
      aria-expanded={isExpanded}
      aria-controls={`filter-section-${title.replace(/\s+/g, "-")}`}
    >
      <HeadingLine title={title} className="mb-0! text-sm!" />
      <ChevronDown
        className={`w-3 h-3 transition-transform duration-200 ${
          isExpanded ? "rotate-180" : ""
        }`}
      />
    </button>
    {isExpanded && (
      <div
        id={`filter-section-${title.replace(/\s+/g, "-")}`}
        className="mt-3 space-y-2"
      >
        {children}
      </div>
    )}
  </div>
);

export default FilterSection;
