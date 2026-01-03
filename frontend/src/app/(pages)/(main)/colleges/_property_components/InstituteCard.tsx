import React from "react";
import {
  LuAward,
  LuGraduationCap,
  LuMapPin,
  LuStar,
  LuUser,
} from "react-icons/lu";
import { PropertyProps } from "@/types/types";
import { generateSlug, getAverageRating } from "@/contexts/Callbacks";
import Link from "next/link";
import Image from "next/image";

const InstituteCard = ({
  institute,
  isListView,
}: {
  isListView: boolean;
  institute: PropertyProps;
}) => {
  const slug = `/${generateSlug(institute.academic_type)}/${
    institute.property_slug
  }`;
  const imageSrc = institute?.featured_image?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${institute.featured_image[0]}`
    : "/img/default-images/campusaim-featured.png";

  const location = [
    institute.property_city,
    institute.property_state,
    institute.property_country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className={`bg-white rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden group ${
        isListView ? "flex flex-col md:flex-row" : ""
      }`}
    >
      {/* Image Section */}
      <Link
        href={slug}
        className={`${
          isListView ? "w-full md:w-80 lg:w-96 flex-shrink-0" : ""
        }`}
      >
        <div
          className={`relative ${isListView ? "h-56 md:h-72" : "h-48 sm:h-56"}`}
        >
          <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
            <Image
              src={imageSrc}
              alt={institute.property_name || "Institute Image"}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </Link>

      {/* Details Section */}
      <div className="flex flex-col p-4 md:p-6 flex-1">
        {/* Title and Rating */}
        <div className="flex justify-between items-start mb-2">
          <Link href={slug}>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 hover:text-purple-600 line-clamp-2">
              {institute.property_name}
            </h3>
          </Link>
          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
            <LuStar className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">
              {getAverageRating(institute.reviews)}/5
            </span>
          </div>
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <LuMapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {/* Academic type and Compare */}
        <div className="flex items-center text-gray-600 text-sm mb-3 gap-2">
          <LuGraduationCap className="w-4 h-4 flex-shrink-0 text-purple-500" />
          <span className="capitalize">{institute.academic_type}</span>
          <Link
            href={`/compare/${institute?.property_slug}`}
            className="ml-auto text-xs sm:text-sm px-3 py-1 border border-purple-600 text-purple-700 rounded-lg hover:bg-purple-600 hover:text-white transition duration-200"
          >
            Compare
          </Link>
        </div>

        {/* Type and Establishment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <LuAward className="w-4 h-4 mr-2 text-purple-500" />
            <span className="line-clamp-1">{institute.property_type}</span>
          </div>
          {institute.est_year && (
            <div className="flex items-center">
              <LuUser className="w-4 h-4 mr-2 text-purple-500" />
              <span>Est. {institute.est_year}</span>
            </div>
          )}
        </div>

        {/* View Details Button */}
        <Link
          href={slug}
          className="mt-auto block w-full text-center bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 hover:scale-[1.02] transition duration-200 font-medium text-sm sm:text-base shadow-lg"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default InstituteCard;
