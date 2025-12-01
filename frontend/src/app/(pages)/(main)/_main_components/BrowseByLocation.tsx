import React from "react";
import { motion } from "framer-motion";
import { FaBuilding } from "react-icons/fa";
import { PropertyProps, SimpleLocationProps } from "@/types/types";
import Link from "next/link";
import { generateSlug } from "@/contexts/Callbacks";
import Image from "next/image";

export default function BrowseByLocation({
  unqieLocations,
  properties,
}: {
  unqieLocations: SimpleLocationProps[];
  properties: PropertyProps[];
}) {
  // ✅ Mock images
  const locationsImages = [
    "/img/browse-by-locations/bbl1.webp",
    "/img/browse-by-locations/bbl2.webp",
    "/img/browse-by-locations/bbl3.webp",
    "/img/browse-by-locations/bbl4.webp",
    "/img/browse-by-locations/bbl5.webp",
    "/img/browse-by-locations/bbl6.webp",
    "/img/browse-by-locations/bbl7.webp",
    "/img/browse-by-locations/bbl8.webp",
    "/img/browse-by-locations/bbl9.webp",
    "/img/browse-by-locations/bbl10.webp",
  ];

  // ✅ Count properties by city
  const propertyCountMap = properties.reduce<Record<string, number>>(
    (acc, property) => {
      const city = property.property_city;
      if (city) {
        acc[city] = (acc[city] || 0) + 1;
      }
      return acc;
    },
    {}
  );

  // ✅ Add count to locations
  const locationsWithCount = unqieLocations.map((loc) => ({
    ...loc,
    count: propertyCountMap[loc?.city || ""] || 0,
  }));

  // ✅ Sort and take top 8
  const topLocations = locationsWithCount
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (topLocations?.length <= 0) return;

  return (
    <section className="relative pt-20 pb-32 px-6 overflow-hidden">
      <div className="relative z-10 text-center max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-center mb-2 leading-snug text-gray-600"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Browse by <span className="text-purple-600"> Location</span>
        </motion.h2>
        {/* Subtitle */}
        <motion.p
          className="text-gray-600 text-center mx-auto mb-12 text-sm sm:text-base max-w-2xl"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
        >
          Photography spots in India`s most breathtaking travel destinations.
        </motion.p>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {topLocations.map((location, index) => (
            <Link
              href={`/yoga-institutes?country=${generateSlug(
                location.country || ""
              )}&state=${generateSlug(
                location.state || ""
              )}&city=${generateSlug(location.city || "")}`}
              key={index}
            >
              <motion.div
                className="group relative overflow-hidden rounded-2xl shadow-lg transform transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Image Container */}
                <div className="relative w-full h-42 overflow-hidden">
                  <Image
                    src={locationsImages[index]}
                    fill
                    alt={location?.city || "city"}
                    className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/60 z-0" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 text-left z-10">
                  <h3 className="text-white font-bold text-xl drop-shadow-md">
                    {location.city}
                  </h3>
                  <p className="text-gray-100 text-sm opacity-90 mb-1 drop-shadow-md">
                    {location.country}
                  </p>
                  <div className="inline-flex items-center gap-2  rounded-full text-white text-sm text-nowrap font-medium drop-shadow-md group-hover:scale-105 transition-all duration-300">
                    <FaBuilding className="h-3 w-3" />
                    <span>{location?.count} Properties</span>
                  </div>
                </div>

                {/* Hover Shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
