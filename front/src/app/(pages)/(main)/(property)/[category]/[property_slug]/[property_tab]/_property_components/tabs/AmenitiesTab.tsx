"use client";

import React, { useState, useEffect } from "react";
import clsx from "clsx";

import { CategoryIcons, SubcategoryIcons } from "@/common/AmenitiesData";
import HeadingLine from "@/ui/headings/HeadingLine";

export default function AmenitiesTab({ property }: { property: any }) {
  // Real amenities from API
  const amenities: Record<string, any[]> = property?.amenities || {};

  const categories = Object.keys(amenities);

  const [activeTab, setActiveTab] = useState<string>(categories[0] || "");

  useEffect(() => {
    if (categories.length > 0) {
      setActiveTab((prev) => prev || categories[0]);
    }
  }, [categories]);

  const parseAmenity = (item: any) => {
    let label = "";
    let children: string[] = [];

    if (typeof item === "string") {
      label = item;
    } else if (typeof item === "object" && item !== null) {
      const key = Object.keys(item)[0];
      const value = item[key];

      label = key;

      if (Array.isArray(value)) {
        children = value;
      }
    }

    return { label, children };
  };

  // Render Category List
  const renderCategoryList = (isMobile: boolean = false) => (
    <>
      {categories.map((category) => {
        const isActive = activeTab === category;

        const baseClasses =
          "flex items-center gap-3 transition-all duration-300 cursor-pointer";

        const mobileClasses = `
          text-sm font-medium px-4 py-2 rounded-custom whitespace-nowrap
          ${
            isActive
              ? "bg-[var(--main-emphasis)] text-[var(--main-light)] text-shadow"
              : "bg-[var(--main-light)] text-[var(--main-emphasis)]"
          }
        `;

        const desktopClasses = `
          w-full text-left px-6 py-4 paragraph font-semibold border-l-4
          ${
            isActive
              ? "bg-[var(--main-emphasis)] text-[var(--main-light)] border-[var(--main)]"
              : "border-transparent hover:bg-[var(--main-light)] hover:text-[var(--main-emphasis)]"
          }
        `;

        return (
          <button
            key={category}
            onClick={() => setActiveTab(category)}
            className={clsx(
              baseClasses,
              isMobile ? mobileClasses : desktopClasses
            )}
          >
            {CategoryIcons[category] &&
              React.createElement(CategoryIcons[category], {
                className: "w-5 h-5 shrink-0",
              })}
            {}
            <span className="grow">{category}</span>

            {!isMobile && (
              <span
                className={clsx(
                  "px-2 py-0.5 rounded-custom paragraph font-bold",
                  isActive
                    ? "bg-[var(--main-light)] text-[var(--main-emphasis)]"
                    : "bg-(--main-light) text-(--main-emphasis)"
                )}
              >
                {amenities[category]?.length || 0}
              </span>
            )}
          </button>
        );
      })}
    </>
  );

  return (
    <div className="bg-(--primary-bg) text-(--text-color)">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
          {/* Mobile Tabs */}
          {categories.length > 0 && (
            <div className="md:hidden border-b border-(--border) p-4">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 -mb-2">
                {renderCategoryList(true)}
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden md:block border-r border-(--border) py-4">
            {renderCategoryList(false)}
          </div>

          {/* Main Content */}
          <div className="p-4">
            {!activeTab ? (
              <p className="paragraph text-center opacity-70">
                No amenities available.
              </p>
            ) : (
              <div key={activeTab}>
                <div className="flex items-baseline justify-between mb-3">
                  <HeadingLine title={activeTab} />
                  <span className="paragraph font-medium">
                    <span className="text-(--main)">
                      {amenities[activeTab]?.length || 0}
                    </span>{" "}
                    facilities
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {(amenities[activeTab] || []).map((item, index) => {
                    const { label, children } = parseAmenity(item);

                    return (
                      <div
                        key={index}
                        className="bg-(--secondary-bg) hover:bg-(--main-light) text-(--text-color-emphasis) hover:text-(--main-emphasis) flex justify-between items-center p-3 rounded-custom shadow-custom transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-4">
                          {SubcategoryIcons[label] &&
                            React.createElement(SubcategoryIcons[label], {
                              className:
                                "text-[var(--main)] group-hover:text-(--main-emphasis) w-5 h-5 shrink-0",
                            })}
                          <span className="paragraph font-semibold">
                            {label}
                          </span>
                        </div>

                        {/* Sub-items */}
                        {children.length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-2">
                            {children.map((c, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 text-xs bg-(--main-light) text-(--main-emphasis) group-hover:bg-(--main-emphasis) group-hover:text-(--main-light) rounded-custom"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {(!amenities[activeTab] ||
                    amenities[activeTab].length === 0) && (
                    <p className="paragraph opacity-60">
                      No amenities in this category.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
