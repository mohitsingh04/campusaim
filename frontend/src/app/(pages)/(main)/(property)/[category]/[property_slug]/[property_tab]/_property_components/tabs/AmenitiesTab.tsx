"use client";
import { AmenitiesProps, PropertyProps } from "@/types/types";
import React, { useState } from "react";
import { LuCircleCheck } from "react-icons/lu";

// Default fallback structure
const defaultAmenities: AmenitiesProps = {
  Mandatory: [],
  "Basic Facilities": [],
  "General Services": [],
  "Yoga Facilities": [],
  "Common Area": [],
  "Outdoor & Recreational": [],
  "Food & Drink": [],
  Transportation: [],
};

export default function AmenitiesTab({
  property,
}: {
  property: PropertyProps | null;
}) {
  const amenities = property?.amenities || defaultAmenities;
  const [activeTab, setActiveTab] = useState<string>("Mandatory");

  if (!amenities) {
    return (
      <div className="p-8 text-center text-gray-500">
        No amenities found for this property.
      </div>
    );
  }

  const categories = Object.keys(amenities);

  return (
    <div className="">
      <div className="max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
          {/* Left Sidebar Tabs */}
          <div className="border-r border-gray-300 backdrop-blur-sm">
            {categories.map((category) => {
              return (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`w-full text-left px-6 py-4 flex justify-between items-center font-medium text-sm md:text-base transition-all duration-300 ${
                    activeTab === category
                      ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2">{category}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      activeTab === category
                        ? "bg-white text-purple-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {amenities[category]?.length || 0}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-600 tracking-wide">
                {activeTab}
              </h2>
              <span className="text-sm text-gray-500">
                {amenities[activeTab]?.length || 0} items
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {amenities[activeTab]?.map((item: any, index: number) => {
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
                  } else if (typeof value === "boolean") {
                    children = [value ? "Available" : "Not Available"];
                  }
                }

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 shadow-xs hover:shadow-sm p-3 rounded-2xl transition transform hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-4">
                      <LuCircleCheck className="text-purple-600 w-6 h-6" />
                      <span className="text-gray-800 font-medium text-lg">
                        {label}
                      </span>
                    </div>
                    {children.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {children.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {(!amenities[activeTab] || amenities[activeTab].length === 0) && (
                <p className="text-gray-500">No amenities available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
