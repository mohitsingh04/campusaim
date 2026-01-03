import { getAverageRating } from "@/contexts/Callbacks";
import { PropertyProps } from "@/types/types";
import Image from "next/image";
import React, { useState } from "react";
import {
  LuX,
  LuPlus,
  LuStar,
  LuMapPin,
  LuCalendar,
  LuGraduationCap,
  LuBuilding2,
  LuChevronDown,
} from "react-icons/lu";

export default function BasicDetailTable({
  selectedProperties,
  removeProperty,
}: {
  selectedProperties: PropertyProps[];
  removeProperty: (property: PropertyProps) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-t-2xl shadow-sm border border-purple-100 overflow-hidden transition-all duration-300 hover:shadow-md">
      <div
        className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 cursor-pointer px-6 py-3 transition-all duration-200 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 relative overflow-hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-10 w-8 h-8 bg-white rounded-full blur-lg"></div>
          <div className="absolute bottom-2 left-10 w-6 h-6 bg-white rounded-full blur-md"></div>
        </div>

        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <LuGraduationCap size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-0.5">
                Basic Comparison
              </h2>
              <p className="text-purple-100 text-xs">
                Overview of {selectedProperties.length} selected colleges
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedProperties?.length < 3 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("openCompareModal"));
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-105 text-xs"
              >
                <LuPlus size={14} />
                Add Insitute
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                // This will be handled by parent component
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("deselectAll"));
                }
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/80 hover:bg-red-600/80 text-white rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-105 text-xs"
            >
              <LuX size={14} />
              Deselect All
            </button>
            <div
              className={`p-2 rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/30 hover:scale-110 ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              <LuChevronDown size={16} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen
            ? "max-h-none opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                <th className="text-left p-4 font-semibold text-gray-800 border-r border-purple-200 min-w-[160px] text-sm"></th>
                {selectedProperties.map((p, i) => (
                  <th
                    key={i}
                    className="text-center p-4 font-semibold text-gray-800 border-r border-purple-200 last:border-r-0 min-w-[200px]"
                  >
                    <div className="flex flex-col items-center relative">
                      {/* Remove button for individual property */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProperty(p);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm z-10"
                        title={`Remove ${p.property_name}`}
                      >
                        <LuX size={12} />
                      </button>

                      {!p?.property_logo?.[0] ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-2 shadow-sm">
                          <span className="text-purple-600 font-bold text-sm">
                            {p.property_name.charAt(0)}
                          </span>
                        </div>
                      ) : (
                        <div className="relative w-14 h-14 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-105 mb-3 overflow-hidden">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${p.property_logo?.[0]}`}
                            alt={p.property_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <span className="text-sm font-medium leading-tight text-center break-words">
                        {p.property_name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Featured Image Row */}
              <tr className="hover:bg-purple-25 transition-colors duration-200">
                <td className="font-semibold p-4 text-gray-700 bg-gradient-to-r from-purple-25 to-purple-50 border-r border-purple-200"></td>
                {selectedProperties.map((p, i) => (
                  <td
                    key={i}
                    className="text-center p-4 border-r border-gray-100 last:border-r-0"
                  >
                    <div className="flex justify-center">
                      <div className="relative group w-40 h-24">
                        <div className="relative w-full h-full rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-105 overflow-hidden">
                          <Image
                            src={
                              p?.featured_image?.[0]
                                ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${p.featured_image?.[0]}`
                                : "/img/default-images/campusaim-featured.png"
                            }
                            alt={p.property_name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Academic Type Row */}
              <tr className="hover:bg-purple-25 transition-colors duration-200">
                <td className="font-semibold p-4 text-gray-700 bg-gradient-to-r from-purple-25 to-purple-50 border-r border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center shadow-sm">
                      <LuGraduationCap size={14} className="text-purple-600" />
                    </div>
                    <span className="text-sm">Academic Type</span>
                  </div>
                </td>
                {selectedProperties.map((p, i) => (
                  <td
                    key={i}
                    className="text-center p-4 border-r border-gray-100 last:border-r-0"
                  >
                    <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-lg text-sm font-medium shadow-sm">
                      {p.category || "Not Available"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Property Type Row */}
              <tr className="hover:bg-purple-25 transition-colors duration-200">
                <td className="font-semibold p-4 text-gray-700 bg-gradient-to-r from-purple-25 to-purple-50 border-r border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center shadow-sm">
                      <LuBuilding2 size={14} className="text-purple-600" />
                    </div>
                    <span className="text-sm">Institution Type</span>
                  </div>
                </td>
                {selectedProperties.map((p, i) => (
                  <td
                    key={i}
                    className="text-center p-4 border-r border-gray-100 last:border-r-0"
                  >
                    <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-lg text-sm font-medium shadow-sm">
                      {p.property_type || "Not Available"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* City Row */}
              <tr className="hover:bg-purple-25 transition-colors duration-200">
                <td className="font-semibold p-4 text-gray-700 bg-gradient-to-r from-purple-25 to-purple-50 border-r border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center shadow-sm">
                      <LuMapPin size={14} className="text-purple-600" />
                    </div>
                    <span className="text-sm">City</span>
                  </div>
                </td>
                {selectedProperties.map((p, i) => (
                  <td
                    key={i}
                    className="text-center p-4 border-r border-gray-100 last:border-r-0"
                  >
                    <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-lg text-sm font-medium shadow-sm">
                      {p.city || "Not Available"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* State Row */}
              <tr className="hover:bg-purple-25 transition-colors duration-200">
                <td className="font-semibold p-4 text-gray-700 bg-gradient-to-r from-purple-25 to-purple-50 border-r border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center shadow-sm">
                      <LuMapPin size={14} className="text-purple-600" />
                    </div>
                    <span className="text-sm">State</span>
                  </div>
                </td>
                {selectedProperties.map((p, i) => (
                  <td
                    key={i}
                    className="text-center p-4 border-r border-gray-100 last:border-r-0"
                  >
                    <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-lg text-sm font-medium shadow-sm">
                      {p.state || "Not Available"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Country Row */}
              <tr className="hover:bg-purple-25 transition-colors duration-200">
                <td className="font-semibold p-4 text-gray-700 bg-gradient-to-r from-purple-25 to-purple-50 border-r border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center shadow-sm">
                      <LuMapPin size={14} className="text-purple-600" />
                    </div>
                    <span className="text-sm">Country</span>
                  </div>
                </td>
                {selectedProperties.map((p, i) => (
                  <td
                    key={i}
                    className="text-center p-4 border-r border-gray-100 last:border-r-0"
                  >
                    <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-lg text-sm font-medium shadow-sm">
                      {p.country || "Not Available"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Rating Row */}
              <tr className="hover:bg-purple-25 transition-colors duration-200">
                <td className="font-semibold p-4 text-gray-700 bg-gradient-to-r from-purple-25 to-purple-50 border-r border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center shadow-sm">
                      <LuStar size={14} className="text-purple-600" />
                    </div>
                    <span className="text-sm">Average Rating</span>
                  </div>
                </td>
                {selectedProperties.map((p, i) => (
                  <td
                    key={i}
                    className="text-center p-4 border-r border-gray-100 last:border-r-0"
                  >
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg shadow-sm">
                      <LuStar
                        size={14}
                        className="text-yellow-500 fill-current"
                      />
                      <span className="font-medium text-purple-700 text-sm">
                        {getAverageRating(p.reviews)}/5
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Established Year Row */}
              <tr className="hover:bg-purple-25 transition-colors duration-200">
                <td className="font-semibold p-4 text-gray-700 bg-gradient-to-r from-purple-25 to-purple-50 border-r border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center shadow-sm">
                      <LuCalendar size={14} className="text-purple-600" />
                    </div>
                    <span className="text-sm">Established</span>
                  </div>
                </td>
                {selectedProperties.map((p, i) => (
                  <td
                    key={i}
                    className="text-center p-4 border-r border-gray-100 last:border-r-0"
                  >
                    <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-lg text-sm font-medium shadow-sm">
                      {p.est_year || "Not Available"}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
