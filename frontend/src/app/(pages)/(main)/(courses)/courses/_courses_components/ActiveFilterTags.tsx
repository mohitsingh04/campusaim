import React from "react";
import { LuX } from "react-icons/lu";
import { CourseFilters } from "@/types/types";

interface ActiveFilterTagsProps {
	filters: CourseFilters;
	onRemoveFilter: (filterType: keyof CourseFilters, value: string) => void;
	onClearAll: () => void;
}

const ActiveFilterTags: React.FC<ActiveFilterTagsProps> = ({
	filters,
	onRemoveFilter,
	onClearAll,
}) => {
	const activeFilters: Array<{
		type: keyof CourseFilters;
		value: string;
		label: string;
	}> = [];

	Object.entries(filters).forEach(([key, values]) => {
		if (Array.isArray(values) && values.length > 0) {
			values.forEach((value) => {
				activeFilters.push({
					type: key as keyof CourseFilters,
					value,
					label: `${key
						.replace("_", " ")
						.replace(/\b\w/g, (c) => c.toUpperCase())}: ${value}`,
				});
			});
		}
	});

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
							key={`${filter.type}-${filter.value}-${index}`}
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
