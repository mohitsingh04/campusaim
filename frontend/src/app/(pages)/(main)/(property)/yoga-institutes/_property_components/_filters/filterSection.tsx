import React from "react";
import { LuChevronDown } from "react-icons/lu";

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children,
}) => (
  <div className="border-b border-gray-200 pb-4 mb-4">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-purple-600 transition-colors cursor-pointer"
    >
      {title}
      <LuChevronDown
        className={`w-4 h-4 transition-transform ${
          isExpanded ? "rotate-180" : ""
        }`}
      />
    </button>
    {isExpanded && <div className="mt-3 space-y-2">{children}</div>}
  </div>
);

export default FilterSection;
