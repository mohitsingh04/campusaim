"use client";
import { generateSlug } from "@/context/Callbacks";
import { useGetAssets } from "@/context/providers/AssetsProviders";
import { PropertyProps } from "@/types/PropertyTypes";
import { ButtonGroup } from "@/ui/buttons/ButtonGroup";
import { BookOpenIcon, MapPinIcon, ScaleIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const PropertyDetailCard = ({
  property,
}: {
  property: PropertyProps | null;
}) => {
  const { getCategoryById } = useGetAssets();
  const imageSrc = property?.featured_image?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${property.featured_image[0]}`
    : "/img/default-images/campusaim-featured.png";

  const logoSrc = property?.property_logo?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${property.property_logo[0]}`
    : "/img/default-images/campusaim-logo.png";

  const location = [
    property?.property_city,
    property?.property_state,
    property?.country,
  ]
    ?.filter(Boolean)
    ?.join(", ");

  const mainCategory = getCategoryById(property?.academic_type || "");
  const mainPropertyTpe = getCategoryById(property?.property_type || "");

  return (
    <div className="overflow-hidden bg-(--primary-bg) sm:rounded-2xl shadow-custom">
      <div className="aspect-2/1 relative overflow-hidden">
        <Image
          src={imageSrc}
          alt={`${property?.property_name} Featured`}
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="px-5 py-3">
        <div className="flex items-center mb-2">
          <div className="w-15 h-15 relative shrink-0">
            <Image
              src={logoSrc}
              alt={`${property?.property_name} Logo`}
              className="object-cover rounded-custom border-2 border-(--border)"
              fill
              priority
              fetchPriority="high"
            />
          </div>
          <div className="ml-3 flex-1">
            <h1 className="heading font-semibold text-(--text-color-emphasis)">
              {property?.property_name}
            </h1>
            <div className="flex items-start text-(--text-color) mt-2 w-full justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm">{mainCategory}</p>
                <p className="text-xs!">({mainPropertyTpe})</p>
              </div>
              {/* <div className="flex flex-2 flex-col items-start text-xs sm:text-sm">
                <div className="flex justify-center items-center gap-2">
                  <p>YP Global Rank : </p>
                  <div className="justify-center items-center gap-1 flex">
                    <p className="font-semibold">{property?.rank}</p>
                  </div>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <p>{property?.property_country} Rank : </p>
                  <div className="justify-center items-center gap-1 flex">
                    <p className="font-semibold">{property?.country_rank}</p>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
        {/* {!property?.claimed && (
          <Link
            href={`/verify/institute/${property?._id}`}
            aria-label="claim-your-Property"
            title="Claim Your Property"
            className="flex items-center gap-2 ms-2 cursor-pointer py-1"
          >
            <span className="relative flex items-center justify-center w-3 h-3 rounded-full bg-(--main) shadow-lg hover:opacity-80 transition cursor-pointer ">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--main) opacity-75" />
            </span>
            <h2 className="heading-sm text-gradient font-medium">
              Claim Your Property
            </h2>
          </Link>
        )} */}

        {location && (
          <div className="flex items-center text-(--text-color) gap-1 ms-2">
            <MapPinIcon className="w-4 h-4 text-(--main)" />
            <h2 className="heading-sm">{location}</h2>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mt-4 text-center text-(--text-color)">
          <Link
            href={`/${generateSlug(mainCategory || "")}/${generateSlug(
              property?.property_slug || "",
            )}/reviews`}
            title={`Reviews ${property?.property_name}`}
            className="flex items-center justify-center px-2 py-1 rounded-custom shadow-custom bg-(--secondary-bg)"
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-(--warning-subtle) me-2">
              <StarIcon className="w-4 h-4 text-(--warning)" />
            </div>
            <p className="text-xs font-semibold ">
              {property?.average_rating || 0} / 5
            </p>
          </Link>
          <Link
            href={`/${generateSlug(mainCategory || "")}/${generateSlug(
              property?.property_slug || "",
            )}/courses`}
            title={`Courses ${property?.property_name}`}
            className="flex  items-center px-2 py-1 justify-center rounded-custom shadow-custom bg-(--secondary-bg)"
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-(--purple-subtle) me-2">
              <BookOpenIcon className="w-4 h-4 text-(--purple)" />
            </div>
            <p className="text-xs font-semibold">
              {property?.courses_count || 0}
            </p>
          </Link>
          <Link
            href={`/compare/${generateSlug(property?.property_slug || "")}`}
            title={`Compare ${property?.property_name}`}
            className="flex items-center border-2 border-(--main) gap-2 py-1 px-2 rounded-custom justify-center shadow-custom bg-(--secondary-bg) hover:scale-105 transition"
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0 rounded-full bg-linear-0 from-(--main) to-(--main-emphasis)">
              <ScaleIcon className="w-4 h-4 text-(--main-subtle)" />
            </div>
            <p className="text-xs font-semibold">Compare</p>
          </Link>
        </div>
        <div className="md:col-span-2 mt-4 gap-y-4">
          <ButtonGroup
            label="Send Enquiry"
            type="submit"
            className="w-full"
            href="#enquiry"
            disable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailCard;
