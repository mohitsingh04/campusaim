import { generateSlug, getAverageRating } from "@/context/Callbacks";
import { PropertyProps } from "@/types/PropertyTypes";
import HeadingLine from "@/ui/headings/HeadingLine";
import Image from "next/image";
import Link from "next/link";
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
  LuTrendingUp,
  LuTrendingDown,
} from "react-icons/lu";

export default function BasicDetailTable({
  selectedProperties,
  removeProperty,
}: {
  selectedProperties: PropertyProps[];
  removeProperty: (property: PropertyProps) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const gridCols =
    selectedProperties.length === 1
      ? "grid-cols-1"
      : selectedProperties.length === 2
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <div
      className={`bg-(--secondary-bg) sm:rounded-t-xl shadow-custom border border-(--border) transition-all duration-300 ${
        isOpen ? "overflow-visible sm:overflow-hidden" : "overflow-hidden"
      }`}
    >
      {/* Header Section (Same for both) */}
      <div
        className="bg-(--main-emphasis) cursor-pointer sm:px-6 px-4 py-3 transition-all duration-200 relative overflow-hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div>
              <HeadingLine
                title="Basic Comparison"
                className="text-(--white)! mb-0!"
              />
              <p className="ml-3 text-(--white)! text-xs sm:text-base">
                Overview of {selectedProperties.length} selected colleges
              </p>
            </div>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-2">
            {selectedProperties?.length < 3 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(new CustomEvent("openCompareModal"));
                }}
                className="flex items-center gap-2 px-3 py-1 bg-(--success-subtle) cursor-pointer text-(--success-emphasis) rounded-custom transition-all duration-200 backdrop-blur-xs hover:scale-105 paragraph"
              >
                <LuPlus size={14} />
                <span className="hidden sm:flex">Add Institute</span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent("deselectAll"));
              }}
              className="flex items-center gap-2 px-3 py-1 bg-(--danger-subtle) text-(--danger) cursor-pointer rounded-custom transition-all duration-200 backdrop-blur-sm hover:scale-105 paragraph"
            >
              <LuX size={14} />
              <span className="hidden sm:flex">Deselect All</span>
            </button>

            <div
              className={`p-2 rounded-full bg-(--main-light) cursor-pointer text-(--main-emphasis) backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              <LuChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen ? "opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="hidden sm:block w-full overflow-x-auto">
          {/* Added table-fixed to ensure equal widths */}
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-(--primary-bg) border-b border-(--border)">
                {/* Fixed width for the Label column */}
                <th className="text-left p-4 font-semibold text-(--text-color) border-r border-(--border) w-52 heading-sm"></th>
                {selectedProperties.map((p, i) => (
                  <th
                    key={i}
                    // Fixed width for property columns to ensure they are identical
                    className="text-center p-4 font-semibold text-(--text-color) border-r border-(--border) last:border-r-0 w-80"
                  >
                    <div className="flex flex-col items-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProperty(p);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-(--danger) text-(--danger-subtle) rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 z-10"
                      >
                        <LuX size={12} />
                      </button>

                      <Link
                        href={`/${generateSlug(p.category)}/${generateSlug(
                          p?.property_slug
                        )}/overview`}
                      >
                        {!p?.property_logo?.[0] ? (
                          <div className="w-10 h-10 rounded-custom flex items-center justify-center mb-2 shadow-custom">
                            <span className="font-bold paragraph">
                              {p.property_name.charAt(0)}
                            </span>
                          </div>
                        ) : (
                          <div className="relative w-14 h-14 rounded-custom shadow-custom transition-all duration-300 mb-3 overflow-hidden">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${p.property_logo?.[0]}`}
                              alt={p.property_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </Link>
                      <Link
                        href={`/${generateSlug(p.category)}/${generateSlug(
                          p?.property_slug
                        )}/overview`}
                        className="paragraph font-medium text-center leading-tight wrap-break-word"
                      >
                        {p.property_name}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              {/* Desktop Rows (Rank, Type, City, State, Country, Rating, Est) */}
              <tr>
                <td className="font-semibold p-4 text-(--text-color) bg-(--primary-bg) border-r border-(--border)">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-(--main-light) text-(--main-emphasis) rounded-custom flex items-center justify-center shadow-custom">
                      <LuGraduationCap size={14} />
                    </div>
                    <span className="heading-sm">YP Rank</span>
                  </div>
                </td>
                {selectedProperties.map((p, i) => (
                  <td
                    key={i}
                    className="text-center p-4 border-r border-(--border) last:border-r-0"
                  >
                    <span className="inline-flex gap-2 text-(--text-color-emphasis)">
                      <p className="font-semibold">#{p?.rank}</p>
                      {(p?.rank || 0) < (p?.lastRank || 0) ? (
                        <LuTrendingUp className="w-5 h-5 text-(--success)" />
                      ) : (
                        <LuTrendingDown className="w-5 h-5 text-(--danger)" />
                      )}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="font-semibold p-4 text-(--text-color) bg-(--primary-bg) border-r border-(--border)">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-(--main-light) text-(--main-emphasis) rounded-custom flex items-center justify-center shadow-custom">
                      <LuGraduationCap size={14} />
                    </div>
                    <span className="heading-sm">Academic Type</span>
                  </div>
                </td>
                {selectedProperties.map((p, i) => (
                  <td
                    key={i}
                    className="text-center p-4 border-r border-(--border) last:border-r-0"
                  >
                    <span className="inline-flex gap-2 text-(--text-color-emphasis)">
                      {p.category || "Not Available"}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="font-semibold p-4 text-(--text-color) bg-(--primary-bg) border-r border-(--border)">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-(--main-light) text-(--main-emphasis) rounded-custom flex items-center justify-center shadow-custom">
                      <LuBuilding2 size={14} />
                    </div>
                    <span className="heading-sm">Institution Type</span>
                  </div>
                </td>
                {selectedProperties.map((p, i) => (
                  <td
                    key={i}
                    className="text-center p-4 border-r border-(--border) last:border-r-0"
                  >
                    <span className="inline-flex gap-2 text-(--text-color-emphasis)">
                      {p.property_type || "Not Available"}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="font-semibold p-4 text-(--text-color) bg-(--primary-bg) border-r border-(--border)">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-(--main-light) text-(--main-emphasis) rounded-custom flex items-center justify-center shadow-custom">
                      <LuMapPin size={14} />
                    </div>
                    <span className="heading-sm">City</span>
                  </div>
                </td>
                {selectedProperties.map((p, i) => (
                  <td
                    key={i}
                    className="text-center p-4 border-r border-(--border) last:border-r-0"
                  >
                    <span className="inline-flex gap-2 text-(--text-color-emphasis)">
                      {p.city || "Not Available"}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="font-semibold p-4 text-(--text-color) bg-(--primary-bg) border-r border-(--border)">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-(--main-light) text-(--main-emphasis) rounded-custom flex items-center justify-center shadow-custom">
                      <LuMapPin size={14} />
                    </div>
                    <span className="heading-sm">State</span>
                  </div>
                </td>
                {selectedProperties.map((p, i) => (
                  <td
                    key={i}
                    className="text-center p-4 border-r border-(--border) last:border-r-0"
                  >
                    <span className="inline-flex gap-2 text-(--text-color-emphasis)">
                      {p.state || "Not Available"}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="font-semibold p-4 text-(--text-color) bg-(--primary-bg) border-r border-(--border)">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-(--main-light) text-(--main-emphasis) rounded-custom flex items-center justify-center shadow-custom">
                      <LuMapPin size={14} />
                    </div>
                    <span className="heading-sm">Country</span>
                  </div>
                </td>
                {selectedProperties.map((p, i) => (
                  <td
                    key={i}
                    className="text-center p-4 border-r border-(--border) last:border-r-0"
                  >
                    <span className="inline-flex gap-2 text-(--text-color-emphasis)">
                      {p.country || "Not Available"}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="font-semibold p-4 text-(--text-color) bg-(--primary-bg) border-r border-(--border)">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-(--main-light) text-(--main-emphasis) rounded-custom flex items-center justify-center shadow-custom">
                      <LuStar size={14} />
                    </div>
                    <span className="heading-sm">Average Rating</span>
                  </div>
                </td>
                {selectedProperties.map((p, i) => (
                  <td
                    key={i}
                    className="text-center p-4 border-r border-(--border) last:border-r-0"
                  >
                    <span className="inline-flex items-center gap-2 text-(--text-color-emphasis)">
                      <LuStar
                        size={14}
                        className="text-(--warning) fill-current"
                      />
                      <span className="inline-flex gap-2 text-(--text-color-emphasis)">
                        {getAverageRating(p.reviews)}/5
                      </span>
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="font-semibold p-4 bg-(--primary-bg) text-(--text-color) border-r border-(--border)">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-(--main-light) text-(--main-emphasis) rounded-custom flex items-center justify-center shadow-custom">
                      <LuCalendar size={14} />
                    </div>
                    <span className="heading-sm">Established</span>
                  </div>
                </td>
                {selectedProperties.map((p, i) => (
                  <td
                    key={i}
                    className="text-center p-4 border-r border-(--border) last:border-r-0"
                  >
                    <span className="inline-flex gap-2 text-(--text-color-emphasis)">
                      {p.est_year || "Not Available"}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="sm:hidden block">
          <div
            className={`grid ${gridCols} border-b border-(--border) bg-(--primary-bg) sticky top-16 `}
          >
            {selectedProperties.map((p, i) => (
              <div
                key={i}
                className={`flex flex-col items-center justify-start p-4 border-(--border) ${
                  i < selectedProperties.length - 1 ? "border-r" : ""
                }`}
              >
                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeProperty(p);
                  }}
                  className="mb-2 self-end w-5 h-5 bg-(--danger) text-(--danger-subtle) rounded-full flex items-center justify-center cursor-pointer"
                >
                  <LuX size={12} />
                </button>

                {/* Logo */}
                <Link
                  href={`/${generateSlug(p.category)}/${generateSlug(
                    p?.property_slug
                  )}/overview`}
                >
                  {!p?.property_logo?.[0] ? (
                    <div className="w-12 h-12 rounded-custom flex items-center justify-center shadow-custom bg-(--secondary-bg)">
                      <span className="font-bold text-lg">
                        {p.property_name.charAt(0)}
                      </span>
                    </div>
                  ) : (
                    <div className="relative w-12 h-12 rounded-custom shadow-custom overflow-hidden">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${p.property_logo?.[0]}`}
                        alt={p.property_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </Link>
                <div className="mt-2 text-center text-xs font-semibold leading-tight line-clamp-2 min-h-[2.5em]">
                  {p.property_name}
                </div>
              </div>
            ))}
          </div>

          <div className="divide-y divide-(--border)">
            <div className="bg-(--primary-bg)">
              <div className="p-2 flex items-center justify-center gap-2 bg-(--secondary-bg) text-(--text-color-empahsis) border border-(--border)">
                <LuGraduationCap size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  YP Rank
                </span>
              </div>
              <div className={`grid ${gridCols}`}>
                {selectedProperties.map((p, i) => (
                  <div
                    key={i}
                    className={`p-3 text-center flex items-center justify-center gap-1 border-(--border) ${
                      i < selectedProperties.length - 1 ? "border-r" : ""
                    }`}
                  >
                    <span className="font-bold text-sm">#{p?.rank}</span>
                    {(p?.rank || 0) < (p?.lastRank || 0) ? (
                      <LuTrendingUp className="w-4 h-4 text-(--success)" />
                    ) : (
                      <LuTrendingDown className="w-4 h-4 text-(--danger)" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* DATA BLOCK: ACADEMIC TYPE */}
            <div className="bg-(--primary-bg)">
              <div className="p-2 flex items-center justify-center gap-2 bg-(--secondary-bg) text-(--text-color-empahsis) border border-(--border)">
                <LuGraduationCap size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Academic Type
                </span>
              </div>
              <div className={`grid ${gridCols}`}>
                {selectedProperties.map((p, i) => (
                  <div
                    key={i}
                    className={`p-3 text-center text-sm border-(--border) ${
                      i < selectedProperties.length - 1 ? "border-r" : ""
                    }`}
                  >
                    {p.category || "N/A"}
                  </div>
                ))}
              </div>
            </div>

            {/* DATA BLOCK: INSTITUTION TYPE */}
            <div className="bg-(--primary-bg)">
              <div className="p-2 flex items-center justify-center gap-2 bg-(--secondary-bg) text-(--text-color-empahsis) border border-(--border)">
                <LuBuilding2 size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Institution Type
                </span>
              </div>
              <div className={`grid ${gridCols}`}>
                {selectedProperties.map((p, i) => (
                  <div
                    key={i}
                    className={`p-3 text-center text-sm border-(--border) ${
                      i < selectedProperties.length - 1 ? "border-r" : ""
                    }`}
                  >
                    {p.property_type || "N/A"}
                  </div>
                ))}
              </div>
            </div>

            {/* DATA BLOCK: CITY */}
            <div className="bg-(--primary-bg)">
              <div className="p-2 flex items-center justify-center gap-2 bg-(--secondary-bg) text-(--text-color-empahsis) border border-(--border)">
                <LuMapPin size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  City
                </span>
              </div>
              <div className={`grid ${gridCols}`}>
                {selectedProperties.map((p, i) => (
                  <div
                    key={i}
                    className={`p-3 text-center text-sm border-(--border) ${
                      i < selectedProperties.length - 1 ? "border-r" : ""
                    }`}
                  >
                    {p.city || "N/A"}
                  </div>
                ))}
              </div>
            </div>

            {/* DATA BLOCK: RATING */}
            <div className="bg-(--primary-bg)">
              <div className="p-2 flex items-center justify-center gap-2 bg-(--secondary-bg) text-(--text-color-empahsis) border border-(--border)">
                <LuStar size={14} />
                <span className="text-xs font-bold uppercase tracking-wider ">
                  Rating
                </span>
              </div>
              <div className={`grid ${gridCols}`}>
                {selectedProperties.map((p, i) => (
                  <div
                    key={i}
                    className={`p-3 flex items-center justify-center gap-1 text-sm border-(--border) ${
                      i < selectedProperties.length - 1 ? "border-r" : ""
                    }`}
                  >
                    <LuStar
                      size={12}
                      className="text-(--warning) fill-current"
                    />
                    <span>{getAverageRating(p.reviews)}/5</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DATA BLOCK: ESTABLISHED */}
            <div className="bg-(--primary-bg)">
              <div className="p-2 flex items-center justify-center gap-2 bg-(--secondary-bg) text-(--text-color-empahsis) border border-(--border)">
                <LuCalendar size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Est. Year
                </span>
              </div>
              <div className={`grid ${gridCols}`}>
                {selectedProperties.map((p, i) => (
                  <div
                    key={i}
                    className={`p-3 text-center text-sm border-(--border) ${
                      i < selectedProperties.length - 1 ? "border-r" : ""
                    }`}
                  >
                    {p.est_year || "N/A"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
