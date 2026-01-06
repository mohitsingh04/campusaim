import { generateSlug, getAverageRating } from "@/contexts/Callbacks";
import { PropertyProps } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  LuBadgeCheck,
  LuBookOpen,
  LuMapPin,
  LuStar,
} from "react-icons/lu";

const PropertyDetailCard = ({
  property,
}: {
  property: PropertyProps | null | undefined;
}) => {
  return (
    <div className="bg-white overflow-hidden sm:rounded-2xl sm:shadow-sm">
      {/* Banner Image */}
      <div className="aspect-video bg-red-900 relative overflow-hidden">
        <Image
          src={
            property?.featured_image?.[0]
              ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${property?.featured_image?.[0]}`
              : "/img/default-images/campusaim-featured.png"
          }
          alt="Property Featured Image"
          fill
          className="object-cover"
        />
      </div>

      {/* Details */}
      <div className="p-2">
        <div className="flex items-center mb-4">
          {/* Logo */}
          <div className="w-12 h-12 relative rounded-full overflow-hidden shadow-xs flex-shrink-0">
            <Image
              src={
                property?.property_logo?.[0]
                  ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${property?.property_logo?.[0]}`
                  : "/img/default-images/campusaim-logo.png"
              }
              alt="Property Logo"
              fill
              className="object-cover"
            />
          </div>

          {/* Name, Category, Rank */}
          <div className="ml-3 min-w-0">
            <div className="flex justify-between items-center">
              <h1 className="text-base md:text-xl font-semibold text-gray-700 leading-tight">
                {property?.property_name}
              </h1>
              <p>
                {property?.verified && (
                  <LuBadgeCheck className="text-green-500 text-2xl font-bold" />
                )}
              </p>
            </div>

            <div className="flex flex-wrap md:flex-nowrap items-center gap-6 mt-1">
              <p className="text-gray-600 text-sm md:text-base whitespace-nowrap">
                {property?.category}
              </p>

              {/* <div className="flex items-center text-sm md:text-base text-gray-600 gap-1 whitespace-nowrap">
                <h5>YP Rank:</h5>
                <div className="flex items-center gap-1">
                  <p className="font-semibold">{property?.rank}</p>
                  {(property?.rank || 0) < (property?.lastRank || 0) ? (
                    <LuTrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <LuTrendingDown className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          {(() => {
            const locationParts = [
              property?.property_city,
              property?.property_state,
            ].filter(Boolean);
            if (locationParts.length === 0) return null;

            return (
              <div className="flex items-center text-gray-500 text-sm md:text-base ms-2 mb-3">
                <LuMapPin className="w-4 h-4 mr-2" />
                <span>{locationParts.join(", ")}</span>
              </div>
            );
          })()}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <Link
            href={`/${generateSlug(property?.category || "")}/${generateSlug(
              property?.property_slug || ""
            )}/reviews`}
            className="flex items-center p-3 justify-center rounded-lg shadow-xs hover:shadow-sm transition"
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-yellow-100 me-2">
              <LuStar className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-xs md:text-sm font-semibold text-gray-800">
              {getAverageRating(property?.reviews)} / 5
            </p>
          </Link>

          <Link
            href={`/${generateSlug(property?.category || "")}/${generateSlug(
              property?.property_slug || ""
            )}/courses`}
            className="flex items-center p-3 justify-center rounded-lg shadow-xs hover:shadow-sm transition"
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 me-2">
              <LuBookOpen className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {property?.courses?.length || 0}
            </p>
          </Link>

          <Link
            href={`/${generateSlug(property?.category || "")}/${generateSlug(
              property?.property_slug || ""
            )}/reviews`}
            className="flex items-center p-3 justify-center rounded-lg shadow-xs hover:shadow-sm transition"
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 me-2">
              <LuStar className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {property?.reviews?.length || 0}
            </p>
          </Link>
        </div>

        {/* Enquiry Button */}
        <div className="md:col-span-2 mt-6">
          <a
            href="#enquiry"
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold hover:opacity-90 transition mb-2"
          >
            Enquiry
          </a>
          <Link
            href="/compare/select"
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-3 border-purple-600 hover:bg-purple-600 text-purple-600 hover:text-white font-semibold hover:opacity-90 transition mb-2"
          >
            Compare
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailCard;
