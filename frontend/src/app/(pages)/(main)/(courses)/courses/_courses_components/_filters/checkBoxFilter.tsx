import React, { useState } from "react";
import { matchesMultiWordSearch } from "../../utils/filterUtils";
import { LuSearch } from "react-icons/lu";
import { generateSlug } from "@/contexts/Callbacks";

interface FilterItem {
  name: string;
  count: number;
}

interface CheckboxFilterProps {
  items: FilterItem[];
  filterType: string;
  selectedItems: string[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (filterType: string, value: string) => void;
}

const CheckboxFilter: React.FC<CheckboxFilterProps> = ({
  items,
  filterType,
  selectedItems,
  searchTerm,
  onSearchChange,
  onFilterChange,
}) => {
  const [inputValue, setInputValue] = useState(searchTerm);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);
    onSearchChange(generateSlug(rawValue));
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const filteredItems = items.filter((item) =>
    matchesMultiWordSearch(item.name, searchTerm)
  );

  return (
    <div className="space-y-2">
      <div className="relative">
        <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
        <input
          type="text"
          placeholder={`Search ${filterType}...`}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          autoComplete="off"
          spellCheck="false"
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none bg-white relative z-0 transition-all duration-200"
        />
      </div>
      <div className="max-h-48 overflow-y-auto space-y-2">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index: number) => {
            const itemSlug = generateSlug(item.name);
            const isChecked = selectedItems.includes(itemSlug);

            return (
              <label
                key={index}
                className="flex items-center justify-between cursor-pointer group hover:bg-gray-50 p-1 rounded transition-colors"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onFilterChange(filterType, itemSlug)}
                    className="appearance-none w-4 h-4 bg-white border-2 r rounded border-white outline outline-purple-500 checked:bg-purple-600 transition-all duration-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 group-hover:text-purple-600 transition-colors cursor-pointer">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500">({item.count})</span>
              </label>
            );
          })
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">
            No {filterType} options match your search
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckboxFilter;
