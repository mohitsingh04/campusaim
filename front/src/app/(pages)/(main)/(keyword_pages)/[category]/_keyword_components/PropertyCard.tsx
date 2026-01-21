import {
  generateSlug,
  getAverageRating,
  stripHtmlAndLimit,
} from "@/context/Callbacks";
import { PropertyProps } from "@/types/PropertyTypes";
import Badge from "@/ui/badge/Badge";
import Image from "next/image";
import Link from "next/link";
import { LuMapPin, LuStar } from "react-icons/lu";

function KeywordPropertyCard({
  property,
  index,
}: {
  property: PropertyProps;
  index: number;
}) {
  const location = [
    property.property_city,
    property.property_state,
    property.property_country,
  ]
    .filter(Boolean)
    .join(", ");

  const logoSrc = property?.property_logo?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${property.property_logo[0]}`
    : "/img/default-images/yp-institute-logo.webp";

  const rating = getAverageRating(property?.reviews) || 0;
  const reviewCount = property?.reviews?.length || 0;

  const serialNo = (index + 1).toString().padStart(2, "0");

  const description = property?.property_description || "";

  return (
    <div className="w-full">
      <Link
        href={`/${generateSlug(property?.category)}/${
          property.property_slug
        }/overview`}
        className="group relative block w-full p-3 md:py-6 md:px-4 bg-(--secondary-bg) transition-all duration-300 rounded-custom shadow-custom hover:shadow-lg"
      >
        {/* Changed layout: Always flex-row to keep list style on mobile */}
        <div className="flex flex-row items-start gap-3 md:gap-6 w-full">
          <div className="flex flex-col items-start justify-start shrink-0">
            {/* Mobile View: Gray, large, with hash */}
            <span className="block md:hidden text-xl text-gray-400 font-normal">
              {index + 1}
            </span>
            {/* Desktop View: Original style */}
            <span className="hidden md:block text-2xl text-(--text-color-emphasis) group-hover:text-(--main) transition-colors font-bold md:mt-1">
              {serialNo}.
            </span>
          </div>

          {/* 2. IMAGE LOGO */}
          {/* Mobile: w-16 h-16, Desktop: w-32 */}
          <div className="w-14 h-14 md:w-24 md:h-24 shrink-0 relative rounded-custom overflow-hidden shadow-custom border border-(--border)">
            <Image
              src={logoSrc}
              alt={property?.property_name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>

          {/* 3. CONTENT */}
          <div className="flex-1 min-w-0 flex flex-col gap-1 md:gap-3 max-w-full overflow-hidden">
            {/* Title */}
            <h3 className="text-sm md:text-2xl font-bold text-(--text-color-emphasis) group-hover:text-(--main) transition-colors w-full leading-tight md:text-wrap md:mt-1">
              {property.property_name}
            </h3>

            {/* Location */}
            {location && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 md:text-(--text-color) font-medium capitalize tracking-wide w-full">
                {/* Hide icon on mobile to save space, show on desktop if desired, or keep as is */}
                <LuMapPin className="hidden md:block w-3.5 h-3.5 shrink-0" />
                <span className="w-full truncate">{location}</span>
              </div>
            )}

            {/* Ratings & Badge Row */}
            <div className="flex items-center flex-wrap gap-2 md:gap-3 w-full mt-1 md:mt-0">
              <div className="flex items-center gap-1.5 md:bg-(--warning-subtle) md:px-2.5 md:py-1 rounded-custom">
                <div className="flex items-center gap-1">
                  <LuStar className="w-3.5 h-3.5 fill-(--warning) text-(--warning)" />
                  <span className="text-xs font-bold text-(--text-color-emphasis) md:text-(--warning-emphasis) leading-none pt-0.5">
                    {rating}
                    <span className="md:hidden text-gray-400 font-normal ml-0.5">
                      ({reviewCount})
                    </span>
                  </span>
                </div>
                {/* Desktop only: Expanded review text */}
                <span className="hidden md:block text-xs uppercase font-bold text-(--warning-emphasis) border-l border-(--warning-emphasis) pl-1">
                  {reviewCount} Reviews
                </span>
              </div>

              {/* Badge */}
              <div className="scale-90 origin-left md:scale-100">
                <Badge label={property.category} color="blue" />
              </div>
            </div>

            {/* Description - HIDDEN on Mobile */}
            <p className="hidden md:block text-sm text-[var(--text-color)] line-clamp-3 w-full break-words opacity-80 overflow-hidden">
              {stripHtmlAndLimit(description, 400)}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default KeywordPropertyCard;
