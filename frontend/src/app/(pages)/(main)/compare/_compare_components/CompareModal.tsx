"use client";
import { PropertyProps } from "@/types/types";
import React, { useEffect, useState, useMemo } from "react";
import {
  LuX,
  LuMapPin,
  LuStar,
  LuGraduationCap,
  LuSearch,
  LuPlus,
} from "react-icons/lu";
import { getAverageRating } from "@/contexts/Callbacks";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    const filtered = allProperties.filter(
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
    return filtered;
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

  const handleCancel = () => {
    setDraftSelectedProperties([...selectedProperties]);
    setSearchTerm("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl relative max-h-[95vh] flex flex-col">
        {/* Compact Header */}
        <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 px-4 py-3">
          <div className="relative z-10 pr-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <LuGraduationCap size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Select Institutes to Compare
                </h2>
                <p className="text-purple-100 text-xs">
                  {draftSelectedProperties.length}/3 selected from{" "}
                  {availableProperties.length} available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar and Selected Properties Row */}
        <div className="px-4 py-3 bg-purple-50 border-b border-purple-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            {/* Search Bar - Always at start */}
            <div className="relative flex-1 w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LuSearch className="h-4 w-4 text-purple-400" />
              </div>
              <input
                type="text"
                placeholder="Search Institutes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm text-sm"
              />
            </div>

            {/* Selected Properties */}
            {draftSelectedProperties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {draftSelectedProperties.map((property) => (
                  <div
                    key={property.uniqueId}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-purple-100 to-purple-200 px-3 py-1.5 rounded-full shadow-sm"
                  >
                    <span className="text-xs font-medium text-purple-700 truncate max-w-[100px]">
                      {property.property_name}
                    </span>
                    <button
                      onClick={() => handleRemoveProperty(property)}
                      className="text-purple-600 hover:text-purple-800 transition-colors ml-1"
                    >
                      <LuX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {availableProperties.length > 0 ? (
            <div className="space-y-2">
              {availableProperties.map((property) => (
                <div
                  key={property.uniqueId}
                  onClick={() => handleAddProperty(property)}
                  className={`group bg-white border-2 border-purple-100 rounded-xl p-3 transition-all duration-300 hover:shadow-sm ${
                    draftSelectedProperties.length >= 3
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-md cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* College Image */}
                    <div className="relative overflow-hidden w-16 h-16 rounded-lg flex-shrink-0">
                      <div className="relative w-full h-full overflow-hidden">
                        <Image
                          src={
                            property?.featured_image?.[0]
                              ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${property.featured_image?.[0]}`
                              : "/img/default-images/yp-institutes.webp"
                          }
                          alt={property.property_name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <LuStar
                          size={10}
                          className="text-yellow-500 fill-current"
                        />
                        <span className="text-xs font-semibold text-gray-700">
                          {getAverageRating(property.reviews)}
                        </span>
                      </div>
                    </div>

                    {/* College Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1 group-hover:text-purple-700 transition-colors text-sm">
                        {property.property_name}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <LuMapPin
                            size={12}
                            className="text-purple-500 flex-shrink-0"
                          />
                          <span className="truncate">
                            {property.city}, {property.state}
                          </span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="truncate">
                          {property.reviews?.length || 0} reviews
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full font-medium">
                          {property.category}
                        </span>
                        {draftSelectedProperties.length < 3 && (
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm">
                            <LuPlus size={14} className="text-purple-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <LuGraduationCap size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm
                  ? "No Institutes found"
                  : "No More Institutes Available"}
              </h3>
              <p className="text-gray-500 text-sm">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "You've selected all available Institutes or reached the maximum limit (3)."}
              </p>
            </div>
          )}
        </div>

        {/* Compact Footer */}
        <div className="border-t border-gray-200 px-4 py-3 bg-gradient-to-r from-gray-50 to-purple-50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {draftSelectedProperties.slice(0, 3).map((prop, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-white rounded-full flex items-center justify-center text-xs font-bold text-purple-700 shadow-sm"
                  >
                    {prop.property_name.charAt(0)}
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-600">
                {draftSelectedProperties.length >= 2
                  ? `${draftSelectedProperties.length} Institutes selected`
                  : draftSelectedProperties.length === 1
                  ? "Select 1 more college"
                  : "Select 2+ Institutes"}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCompare}
                disabled={draftSelectedProperties.length < 2}
                className={`px-4 py-1.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5 text-sm ${
                  draftSelectedProperties.length >= 2
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <LuGraduationCap size={14} />
                {draftSelectedProperties.length === 0
                  ? "Select Institutes"
                  : "Compare"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
