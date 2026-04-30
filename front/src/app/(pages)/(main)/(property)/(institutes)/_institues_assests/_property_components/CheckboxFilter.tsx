import { generateSlug } from "@/context/Callbacks";
import React, { useState } from "react";
import { matchesMultiWordSearch } from "../utils/filterUtils";
import { InputGroup } from "@/ui/form/FormComponents";

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
        <InputGroup
          type="text"
          placeholder={`Search ${filterType}...`}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
        />
      </div>
      <div className="max-h-48 overflow-y-auto p-1 space-y-2 hide-scrollbar">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index: number) => {
            const itemSlug = generateSlug(item.name);
            const isChecked = selectedItems?.includes(itemSlug);

            return (
              <label
                key={index}
                className="flex items-center justify-between cursor-pointer group hover:bg-(--secondary-bg) rounded transition-colors"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onFilterChange(filterType, itemSlug)}
                    className="w-3 h-3 cursor-pointer"
                  />
                  <span className="ml-2 paragraph group-hover:text-(--main) transition-colors cursor-pointer">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs">({item.count})</span>
              </label>
            );
          })
        ) : (
          <div className="text-center py-4">
            No {filterType} options match your search
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckboxFilter;
