"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  LuX,
  LuGraduationCap,
  LuSearch,
  LuPlus,
  LuTrendingUp,
  LuTrendingDown,
  LuStar,
} from "react-icons/lu";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaGraduationCap } from "react-icons/fa";
import { PropertyProps } from "@/types/PropertyTypes";
import HeadingLine from "@/ui/headings/HeadingLine";
import { getAverageRating } from "@/context/Callbacks";
import Badge from "@/ui/badge/Badge";

export default function CompareModal({
  allProperties,
  selectedProperties,
  onClose,
  setSelectedProperties,
}: {
  allProperties: PropertyProps[];
  setSelectedProperties: (properties: PropertyProps[]) => void;
  onClose: () => void;
  selectedProperties: PropertyProps[];
}) {
  const [draftSelectedProperties, setDraftSelectedProperties] = useState<
    PropertyProps[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const availableProperties = useMemo(() => {
    return allProperties.filter(
      (property) =>
        !draftSelectedProperties.some(
          (p) => p.uniqueId === property.uniqueId
        ) &&
        (searchTerm === "" ||
          property.property_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.category?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allProperties, draftSelectedProperties, searchTerm]);

  useEffect(() => {
    setDraftSelectedProperties([...selectedProperties]);
  }, [selectedProperties]);

  const handleAddProperty = (property: PropertyProps) => {
    if (draftSelectedProperties.length < 3) {
      setDraftSelectedProperties([...draftSelectedProperties, property]);
    }
  };

  const handleRemoveProperty = (property: PropertyProps) => {
    setDraftSelectedProperties(
      draftSelectedProperties.filter((p) => p.uniqueId !== property.uniqueId)
    );
  };

  const handleCompare = () => {
    if (draftSelectedProperties.length >= 2) {
      const slugs = draftSelectedProperties
        .map((prop) => prop.property_slug)
        .join("-vs-");

      setSelectedProperties(draftSelectedProperties);
      onClose();
      router.push(`/compare/${slugs}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl bg-(--primary-bg) sm:rounded-lg overflow-hidden shadow-custom flex flex-col  transition-all duration-300">
        <div className="shrink-0 px-5 pt-6 pb-4 border-b border-(--border)">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <HeadingLine title="Compare Institutes" />
                <div className="mt-2 flex items-center gap-2 text-sm text-(--text-color)">
                  <span
                    className={`px-2 py-0.5 rounded-custom font-bold ${
                      draftSelectedProperties.length === 3
                        ? "bg-(--success-subtle) text-(--success-emphasis)"
                        : "bg-(--main-light) text-(--main-emphasis)"
                    }`}
                  >
                    {draftSelectedProperties.length}/3 Selected
                  </span>
                  from
                  <span className="text-(--main) font-bold">
                    {" "}
                    {availableProperties.length}{" "}
                  </span>
                  available
                </div>
              </div>
            </div>

            <div className="relative group shadow-custom rounded-custom overflow-hidden">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LuSearch className="h-5 w-5 text-(--text-color) group-focus-within:text-(--main) transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by name, city, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3  bg-(--secondary-bg) text-(--text-color) placeholder:text-(--text-color)/70 transition-all"
              />
            </div>

            {draftSelectedProperties.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar whitespace-nowrap mask-linear-fade">
                {draftSelectedProperties.map((property) => (
                  <div
                    key={property.uniqueId}
                    className="flex-shrink-0 flex items-center gap-2 bg-(--secondary-bg) text-(--text-color-emphasis) pl-3 pr-2 py-1.5 rounded-custom"
                  >
                    <span className="text-sm font-medium">
                      {property.property_name}
                    </span>
                    <button
                      onClick={() => handleRemoveProperty(property)}
                      className="rounded-full transition-colors cursor-pointer"
                    >
                      <LuX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-(--secondary-bg)">
          {availableProperties.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {availableProperties.map((property) => (
                <div
                  key={property.uniqueId}
                  onClick={() => handleAddProperty(property)}
                  className={`group relative flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 rounded-custom bg-(--primary-bg) shadow-custom transition-all duration-300 cursor-pointer ${
                    draftSelectedProperties.length >= 3
                      ? "opacity-60 grayscale cursor-not-allowed"
                      : ""
                  }`}
                >
                  <div className="flex flex-row sm:block items-center sm:items-start gap-3 shrink-0">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-custom shadow-custom border border-(--border) overflow-hidden shrink-0">
                      {property.property_logo?.[0] ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${property.property_logo[0]}`}
                          alt={property.property_name}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-(--secondary-bg) text-(--text-color-empahsis) font-bold text-2xl">
                          {property.property_name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 sm:hidden min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge label={property?.category} color="main" />
                      </div>
                      <h3 className="text-base font-semibold text-(--text-color-emphasis) leading-tight line-clamp-2">
                        {property.property_name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center gap-2 min-w-0">
                    <div className="hidden sm:flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge label={property?.category} color="main" />
                      </div>
                      <h3 className="text-base font-semibold text-(--text-color-emphasis) leading-tight group-hover:text-(--main) transition-colors truncate">
                        {property.property_name}
                      </h3>
                    </div>

                    {(() => {
                      const locationParts = [
                        property?.property_city,
                        property?.property_state,
                        property?.property_country,
                      ].filter(Boolean);

                      return locationParts.length > 0 ? (
                        <p className="text-xs text-(--text-color)">
                          {locationParts.join(", ")}
                        </p>
                      ) : null;
                    })()}

                    <div className="flex flex-wrap justify-between items-center gap-4 mt-1 pt-2 sm:pt-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-(--text-color)">YP Rank:</span>
                        <div className="flex items-center gap-1 font-semibold text-(--text-color-emphasis)">
                          <span>#{property?.rank || "N/A"}</span>
                          {(property?.rank || 0) < (property?.lastRank || 0) ? (
                            <LuTrendingUp className="w-4 h-4 text-(--success)" />
                          ) : (
                            <LuTrendingDown className="w-4 h-4 text-(--danger)" />
                          )}
                        </div>
                      </div>
                      <div>
                        {(property?.reviews?.length || 0) > 0 ? (
                          <div className="flex items-center gap-1 text-xs font-bold">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, idx) => (
                                <LuStar
                                  key={idx}
                                  size={12}
                                  className={
                                    idx <
                                    Math.round(
                                      getAverageRating(property?.reviews)
                                    )
                                      ? "fill-current text-(--warning)"
                                      : "fill-transparent text-(--text-color)"
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-(--warning) ml-1">
                              {getAverageRating(property?.reviews)}
                            </span>
                            <span className="text-(--text-color)">
                              ({property.reviews?.length || 0})
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex shrink-0 flex-col justify-start items-end pl-4">
                    <div className="w-10 h-10 rounded-full bg-(--main-light) text-(--main-emphasis) group-hover:bg-(--main-emphasis) group-hover:text-(--main-light) transition-all duration-300 flex items-center justify-center ">
                      <LuPlus size={20} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-70">
              <div className="w-20 h-20 bg-(--secondary-bg) rounded-full flex items-center justify-center mb-4">
                <FaGraduationCap className="w-10 h-10 text-(--main)" />
              </div>
              <h3 className="text-xl font-bold text-(--text-color-emphasis)">
                {searchTerm ? "No results found" : "Selection Complete"}
              </h3>
              <p className="text-(--text-color) max-w-xs mt-2">
                {searchTerm
                  ? "Try searching for a different institute."
                  : "You can remove a selected institute to add a new one."}
              </p>
            </div>
          )}
        </div>

        <div className="shrink-0 p-5 bg-(--primary-bg) border-t border-(--border)">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex -space-x-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full border-2 border-(--main) flex items-center justify-center text-sm font-bold shadow-sm ${
                      draftSelectedProperties[i]
                        ? "bg-(--main-emphasis) text-(--main-light)"
                        : "bg-(--main-light) text-(--main-emphasis)"
                    }`}
                  >
                    {draftSelectedProperties[i] ? (
                      draftSelectedProperties[i].property_name.charAt(0)
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                {draftSelectedProperties.length < 2 ? (
                  <span className="text-(--text-color)">
                    Select at least{" "}
                    <span className="text-(--main) font-bold">2 items</span> to
                    compare
                  </span>
                ) : (
                  <span className="text-(--success) font-medium">
                    Ready to compare!
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleCompare}
              disabled={draftSelectedProperties.length < 2}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-custom flex items-center justify-center gap-2 shadow-custom transition-all duration-300 ${
                draftSelectedProperties.length < 2
                  ? "bg-(--secondary-bg) text-(--text-color) cursor-not-allowed"
                  : "btn-shine font-bold"
              }`}
            >
              <LuGraduationCap size={20} />
              <span>
                {draftSelectedProperties.length < 2
                  ? "Select More"
                  : "Compare Now"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
