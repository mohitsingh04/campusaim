import { eventFilterProps } from "@/types/EventFilterTypes";
import React from "react";
import { FaTimes } from "react-icons/fa";

interface ActiveFilterTagsProps {
  filters: eventFilterProps;
  onRemoveFilter: (filterType: keyof eventFilterProps, value: string) => void;
  onClearAll: () => void;
}

const ActiveFilterTags: React.FC<ActiveFilterTagsProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
}) => {
  const getActiveFilters = () => {
    const activeFilters: Array<{
      type: keyof eventFilterProps;
      value: string;
      label: string;
    }> = [];

    Object.entries(filters).forEach(([key, values]) => {
      if (Array.isArray(values)) {
        values.forEach((value) => {
          activeFilters.push({
            type: key as keyof eventFilterProps,
            value,
            label: `${
              key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")
            }: ${value}`,
          });
        });
      }
    });

    return activeFilters;
  };

  const activeFilters = getActiveFilters();

  if (activeFilters.length === 0) return null;

  return (
    <div className="mb-6 shrink-0">
      <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
        <div className="flex items-center justify-between mb-3">
          <h3 className="sub-heading font-medium">Active Filters</h3>
          <button
            onClick={onClearAll}
            className="text-(--main) cursor-pointer paragraph font-medium flex items-center"
          >
            Clear All
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <span
              key={index}
              className="inline-flex items-center bg-(--main-light) text-(--main) px-3 py-1 rounded-custom  text-xs font-medium"
            >
              {filter.label}
              <button
                onClick={() => onRemoveFilter(filter.type, filter.value)}
                className="ml-2 cursor-pointer"
                aria-label={`Remove filter: ${filter.label}`}
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveFilterTags;
