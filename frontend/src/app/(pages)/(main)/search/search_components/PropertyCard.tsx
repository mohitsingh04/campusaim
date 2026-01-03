import { generateSlug } from "@/contexts/Callbacks";
import { PropertyProps } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { LuLandmark, LuMap } from "react-icons/lu";

export default function PropertyCard({
  property,
}: {
  property: PropertyProps;
}) {
  return (
    <section>
      <div className="bg-white p-6 rounded-2xl shadow-xs flex justify-between items-start mt-2">
        <div className="flex items-start gap-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-xs">
            <Image
              src={
                property?.property_logo?.[0]
                  ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${property?.property_logo?.[0]}`
                  : "/img/default-images/campusaim-logo.png"
              }
              alt="Logo"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href={`/${generateSlug(property?.category)}/${
                property.property_slug
              }`}
              className="text-lg font-semibold text-purple-600 hover:text-purple-900"
            >
              {property?.property_name}
            </Link>

            <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
              <LuMap className="w-4 h-4 text-purple-500" />
              <span>
                {property?.property_city && <>{property?.property_city}</>}{" "}
                {property?.property_state && <>{property?.property_state}</>}{" "}
                {property?.property_country && (
                  <>{property?.property_country}</>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <LuLandmark className="w-5 h-5 text-purple-600" />
          <h3 className="text-xl font-bold text-purple-800">
            {property?.category}
          </h3>
        </div>
      </div>
    </section>
  );
}
