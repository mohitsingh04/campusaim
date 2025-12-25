import React from "react";
import { LuX } from "react-icons/lu";

interface Filters {
  country: string[];
  state: string[];
  city: string[];
  course_name: string[];
  course_level: string[];
  course_type: string[];
  course_format: string[];
  rating: string[];
  category: string[];
  property_type: string[];
}

interface ActiveFilterTagsProps {
  filters: Filters;
  onRemoveFilter: (filterType: keyof Filters, value: string) => void;
  onClearAll: () => void;
}

const ActiveFilterTags: React.FC<ActiveFilterTagsProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
}) => {
  const getActiveFilters = () => {
    const activeFilters: Array<{
      type: keyof Filters;
      value: string;
      label: string;
    }> = [];

    Object.entries(filters).forEach(([key, values]) => {
      if (Array.isArray(values)) {
        values.forEach((value) => {
          activeFilters.push({
            type: key as keyof Filters,
            value,
            label: `${key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}: ${value}`,
          });
        });
      }
    });

    return activeFilters;
  };

  const activeFilters = getActiveFilters();

  if (activeFilters.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Active Filters</h4>
          <button
            onClick={onClearAll}
            className="text-purple-600 hover:text-purple-700 bg-purple-100 px-4 py-2 rounded-xl text-sm font-medium flex items-center cursor-pointer"
          >
            <LuX className="w-4 h-4 mr-1" />
            Clear All
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <span
              key={index}
              className="inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-medium"
            >
              {filter.label}
              <button
                onClick={() => onRemoveFilter(filter.type, filter.value)}
                className="ml-2 text-purple-500 hover:text-purple-700 cursor-pointer"
              >
                <LuX className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveFilterTags;