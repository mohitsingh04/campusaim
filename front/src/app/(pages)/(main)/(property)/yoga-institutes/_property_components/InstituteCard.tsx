import { FaStar } from "react-icons/fa";
import { PiCalendarDots, PiCertificate, PiGraduationCap } from "react-icons/pi";

import Link from "next/link";
import Image from "next/image";

import { ButtonGroup } from "@/ui/buttons/ButtonGroup";
import { PropertyProps } from "@/types/PropertyTypes";
import { generateSlug, getAverageRating } from "@/context/Callbacks";

const InstituteCard = ({
  institute,
  isListView,
}: {
  institute: PropertyProps;
  isListView: boolean;
}) => {
  if (!institute) return null;

  const slug = `/${generateSlug(institute.category)}/${
    institute.property_slug
  }/overview`;

  const imageSrc = institute?.featured_image?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${institute.featured_image[0]}`
    : "/img/default-images/yp-institutes.webp";

  const logoSrc = institute?.property_logo?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${institute.property_logo[0]}`
    : "/img/default-images/yp-institute-logo.webp";

  const location = [
    institute.property_city,
    institute.property_state,
    institute.property_country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className={`bg-(--primary-bg) rounded-custom shadow-custom transition-all duration-300 overflow-hidden group
        ${
          isListView
            ? "flex flex-col md:flex-row h-full"
            : "flex flex-col h-full"
        }`}
    >
      <div
        className={`overflow-hidden ${
          isListView ? "w-full md:w-80 lg:w-96 shrink-0" : "w-full"
        }`}
      >
        <Link href={slug}>
          <div
            className={`relative w-full ${
              isListView ? "h-56 md:h-full" : "aspect-2/1 min-h-48"
            }`}
          >
            <Image
              src={imageSrc}
              alt={institute.property_name || "Yoga Institute"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute top-3 right-3 bg-(--warning-subtle) px-3 py-1 rounded-custom flex items-center gap-1 shadow-custom">
              <FaStar className="w-3 h-3 text-(--warning)" />
              <p className="font-medium text-(--warning-emphasis)">
                {getAverageRating(institute.reviews)}/5
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-4 h-full">
        <div
          className={`flex gap-4 ${
            isListView ? "items-center" : "flex-col items-start"
          }`}
        >
          <div
            className={`relative overflow-hidden rounded-custom border-4 border-(--primary-bg)
              shadow-md bg-white shrink-0
              ${isListView ? "w-16 h-16" : "w-16 h-16 -mt-12"}
            `}
          >
            <Image
              src={logoSrc}
              alt="Institute Logo"
              fill
              className="object-contain"
            />
          </div>

          <div className="min-w-0">
            <Link href={slug}>
              <h2 className="sub-heading font-semibold hover:text-(--main) line-clamp-2">
                {institute.property_name || "Unnamed Institute"}
              </h2>
            </Link>

            <p className="text-sm">
              {location
                ? location
                : generateSlug(institute?.property_type) ===
                  generateSlug("Online Yoga Studio")
                ? "Online"
                : "N/A"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <PiGraduationCap className="text-(--main) w-4 h-4" />
            <p>{institute.category || "N/A"}</p>
          </div>

          <div className="flex items-center gap-2">
            <PiCertificate className="text-(--main) w-4 h-4" />
            <p>{institute.property_type || "N/A"}</p>
          </div>

          {/* <div className="flex items-center gap-2">
            <GiRank3 className="text-(--main) w-4 h-4" />
            <p>YP Rank: {institute.rank || "N/A"}</p>
          </div> */}

          {institute.est_year && (
            <div className="flex items-center gap-2">
              <PiCalendarDots className="text-(--main) w-4 h-4" />
              <p>{institute.est_year}</p>
            </div>
          )}
        </div>
        <div className={`mt-auto ${isListView ? "flex justify-end" : ""}`}>
          <ButtonGroup
            label="View Details"
            href={slug}
            className={isListView ? "w-auto px-6" : "w-full"}
            disable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default InstituteCard;
