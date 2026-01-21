"use client";
import { generateSlug, getAverageRating } from "@/context/Callbacks";
import { PropertyProps } from "@/types/PropertyTypes";
import { ButtonGroup } from "@/ui/buttons/ButtonGroup";
import Image from "next/image";
import Link from "next/link";
import { FaBalanceScale } from "react-icons/fa";
import { LuBookOpen, LuMapPin, LuStar } from "react-icons/lu";

const PropertyDetailCard = ({
  property,
}: {
  property: PropertyProps | null;
}) => {
  const imageSrc = property?.featured_image?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${property.featured_image[0]}`
    : "/img/default-images/yp-institutes.webp";

  const logoSrc = property?.property_logo?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${property.property_logo[0]}`
    : "/img/default-images/yp-institute-logo.webp";

  return (
    <div className=" overflow-hidden bg-(--primary-bg) sm:rounded-2xl shadow-custom">
      <div className="aspect-2/1 relative overflow-hidden">
        <Image
          src={imageSrc}
          alt="University"
          fill
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center mb-2">
          <div className="w-12 h-12 relative">
            <Image
              src={logoSrc}
              alt="Institute Logo"
              className="object-cover rounded-full"
              fill
            />
          </div>
          <div className="ml-3">
            <h1 className="heading font-semibold text-(--text-color-emphasis)">
              {property?.property_name}
            </h1>
            <div className="flex items-center text-(--text-color) gap-10 lg:gap-6 justify-start">
              <p className="">{property?.category}</p>
              {/* <div className="flex justify-center  items-center gap-2">
                <p>YP Rank : </p>
                <div className="justify-center items-center gap-1 flex">
                  <p className=" font-semFibold">{property?.rank}</p>
                  {(property?.rank || 0) < (property?.lastRank || 0) ? (
                    <LuTrendingUp className="w-5 h-5 text-(--success)" />
                  ) : (
                    <LuTrendingDown className="w-5 h-5 text-(--danger)" />
                  )}
                </div>
              </div> */}
            </div>
          </div>
        </div>
        {/* <Link
          href={`/verify/institute/${property?._id}`}
          className="flex items-center gap-2 ms-2 cursor-pointer py-1"
        >
          <button className="relative flex items-center justify-center w-3 h-3 rounded-full bg-(--orange) shadow-lg hover:opacity-80 transition cursor-pointer ">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--orange) opacity-75" />
          </button>
          <h2 className="heading-sm text-(--main) font-medium">
            Claim Your Property
          </h2>
        </Link> */}

        {(() => {
          const locationParts = [
            property?.property_city,
            property?.property_state,
          ].filter(Boolean);
          if (locationParts.length === 0) return null;

          return (
            <div className="flex items-center text-(--text-color) gap-1 ms-2">
              <LuMapPin className="w-4 h-4 text-(--main)" />
              <h2 className="heading-sm">{locationParts.join(", ")}</h2>
            </div>
          );
        })()}

        <div className="grid grid-cols-3 gap-3 mt-4 text-center text-(--text-color)">
          <Link
            href={`/${generateSlug(property?.category || "")}/${generateSlug(
              property?.property_slug || ""
            )}/reviews`}
            className="flex items-center justify-center px-2 py-1 rounded-custom shadow-custom bg-(--secondary-bg)"
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-(--warning-subtle) me-2">
              <LuStar className="w-4 h-4 text-(--warning)" />
            </div>
            <p className="text-xs font-semibold ">
              {getAverageRating(property?.reviews)} / 5
            </p>
          </Link>
          <Link
            href={`/${generateSlug(property?.category || "")}/${generateSlug(
              property?.property_slug || ""
            )}/courses`}
            className="flex  items-center px-2 py-1 justify-center rounded-custom shadow-custom bg-(--secondary-bg)"
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-(--purple-subtle) me-2">
              <LuBookOpen className="w-4 h-4 text-(--purple)" />
            </div>
            <p className="text-xs font-semibold">
              {property?.courses?.length || 0}
            </p>
          </Link>
          <Link
            href={`/compare/${generateSlug(property?.property_slug || "")}`}
            className="flex items-center gap-2 py-1 px-2 rounded-custom justify-center shadow-custom bg-(--secondary-bg)"
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-(--success-subtle) me-2">
              <FaBalanceScale className="w-4 h-4 text-(--success)" />
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
