"use client";

import { generateSlug } from "@/context/Callbacks";
import { PropertyProps } from "@/types/PropertyTypes";
import HeadingLine from "@/ui/headings/HeadingLine";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  LuChevronDown,
  LuWifi,
  LuCircleCheck,
  LuCircleX,
  LuBuilding,
} from "react-icons/lu";

export default function AmenityTable({
  selectedProperties,
}: {
  selectedProperties: PropertyProps[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Extract unique amenities
  const amenitySet = new Set<string>();
  selectedProperties.forEach((property) => {
    if (property.amenities) {
      Object.values(property.amenities).forEach((categoryArray) => {
        categoryArray.forEach((amenityObj) => {
          const amenityName = Object.keys(amenityObj)[0];
          amenitySet.add(amenityName);
        });
      });
    }
  });

  const allAmenities = Array.from(amenitySet).sort();

  // Helper for Mobile Grid Columns
  const gridCols =
    selectedProperties.length === 1
      ? "grid-cols-1"
      : selectedProperties.length === 2
      ? "grid-cols-2"
      : "grid-cols-3";

  // Helper function to check amenity existence
  const checkAmenity = (prop: PropertyProps, amenity: string) => {
    let hasAmenity = false;
    if (prop.amenities) {
      Object.values(prop.amenities).forEach((categoryArray) => {
        categoryArray.forEach((amenityObj) => {
          if (amenityObj[amenity] !== undefined) {
            hasAmenity =
              amenityObj[amenity] === true ||
              (Array.isArray(amenityObj[amenity]) &&
                amenityObj[amenity].length > 0);
          }
        });
      });
    }
    return hasAmenity;
  };

  return (
    <div
      className={`bg-(--secondary-bg) shadow-custom border border-(--border) transition-all duration-300 ${
        isOpen ? "overflow-visible" : "overflow-hidden"
      }`}
    >
      {/* Header */}
      <div
        className="bg-(--main-emphasis) cursor-pointer sm:px-6 px-4 py-3 transition-all duration-200 relative overflow-hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div>
              <HeadingLine
                title="Amenities Comparison"
                className="text-(--white)! mb-0!"
              />
              <p className="ml-3 text-(--white)! text-xs sm:text-base">
                Compare facilities across {selectedProperties.length} colleges
              </p>
            </div>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-2">
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

      {/* Content */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen ? "opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-0">
          {allAmenities.length > 0 ? (
            <>
              <div className="hidden sm:block w-full overflow-x-auto">
                {/* Added table-fixed here */}
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="bg-(--primary-bg) text-(--text-color) border-b border-(--border)">
                      {/* Fixed width for label column */}
                      <th className="p-4 font-semibold border-r border-(--border) w-52 sub-heading"></th>
                      {selectedProperties.map((p, i) => (
                        <th
                          key={i}
                          // Fixed width for property columns
                          className="text-center p-4 font-semibold text-(--text-color) border-r border-(--border) last:border-r-0 w-80"
                        >
                          <div className="flex flex-col items-center relative">
                            <Link
                              href={`/${generateSlug(
                                p.category
                              )}/${generateSlug(p?.property_slug)}/overview`}
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
                              href={`/${generateSlug(
                                p.category
                              )}/${generateSlug(p?.property_slug)}/overview`}
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
                    {allAmenities.map((amenity, idx) => (
                      <tr key={idx} className="hover:bg-(--secondary-bg)">
                        <td className="font-semibold p-4 text-(--text-color) bg-(--primary-bg) border-r border-(--border)">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-(--main-light) text-(--main-emphasis) rounded-custom flex items-center justify-center shadow-custom">
                              <LuBuilding size={14} />
                            </div>
                            <span className="heading-sm">{amenity}</span>
                          </div>
                        </td>

                        {selectedProperties.map((prop, pIdx) => {
                          const hasAmenity = checkAmenity(prop, amenity);
                          return (
                            <td
                              key={pIdx}
                              className="text-center p-4 border-r border-(--border) last:border-r-0"
                            >
                              <div className="flex justify-center">
                                {hasAmenity ? (
                                  <div className="w-8 h-8 rounded-full bg-(--success-light) flex items-center justify-center text-(--success)">
                                    <LuCircleCheck size={18} />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-(--danger-light) flex items-center justify-center text-(--danger)">
                                    <LuCircleX size={18} />
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden block">
                {/* STICKY HEADER: LOGOS */}
                <div className="sticky top-16 z-0 bg-(--primary-bg) border-b border-(--border)">
                  <div className={`grid ${gridCols} bg-(--primary-bg)`}>
                    {selectedProperties.map((p, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center justify-start p-3 border-(--border) ${
                          i < selectedProperties.length - 1 ? "border-r" : ""
                        }`}
                      >
                        <Link
                          href={`/${generateSlug(p.category)}/${generateSlug(
                            p?.property_slug
                          )}/overview`}
                        >
                          {!p?.property_logo?.[0] ? (
                            <div className="w-8 h-8 rounded-custom flex items-center justify-center shadow-custom bg-(--secondary-bg) mb-1">
                              <span className="font-bold text-sm">
                                {p.property_name.charAt(0)}
                              </span>
                            </div>
                          ) : (
                            <div className="relative w-8 h-8 rounded-custom shadow-custom overflow-hidden mb-1">
                              <Image
                                src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${p.property_logo?.[0]}`}
                                alt={p.property_name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                        </Link>
                        <div className="text-center text-[10px] font-semibold leading-tight line-clamp-2 min-h-[2.4em]">
                          {p.property_name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SCROLLABLE DATA ROWS */}
                <div className="divide-y divide-(--border)">
                  {allAmenities.map((amenity, idx) => (
                    <div key={idx} className="bg-(--primary-bg)">
                      {/* Row Label */}
                      <div className="p-2 flex items-center justify-center gap-2 bg-(--secondary-bg) text-(--text-color-emphasis) border-b border-(--border)">
                        <LuBuilding size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider text-center">
                          {amenity}
                        </span>
                      </div>

                      {/* Row Data (Check/X Grid) */}
                      <div className={`grid ${gridCols}`}>
                        {selectedProperties.map((prop, pIdx) => {
                          const hasAmenity = checkAmenity(prop, amenity);
                          return (
                            <div
                              key={pIdx}
                              className={`p-3 flex items-center justify-center border-(--border) ${
                                pIdx < selectedProperties.length - 1
                                  ? "border-r"
                                  : ""
                              }`}
                            >
                              {hasAmenity ? (
                                <div className="w-8 h-8 rounded-full bg-(--success-light) flex items-center justify-center text-(--success)">
                                  <LuCircleCheck size={18} />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-(--danger-light) flex items-center justify-center text-(--danger)">
                                  <LuCircleX size={18} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-(--text-color) bg-(--primary-bg)">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-custom">
                <LuWifi size={24} />
              </div>
              <h3 className="sub-heading font-semibold mb-2">
                No Amenities Data
              </h3>
              <p>No amenities data available for comparison</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
