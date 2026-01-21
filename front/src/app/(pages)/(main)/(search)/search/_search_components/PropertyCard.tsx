import { generateSlug } from "@/context/Callbacks";
import { PropertyProps } from "@/types/PropertyTypes";
import Image from "next/image";
import Link from "next/link";
import { LuLandmark, LuMap } from "react-icons/lu";

export default function PropertyCard({
  property,
}: {
  property: PropertyProps;
}) {
  return (
    <section className="w-full">
      <div className="bg-(--primary-bg) text-(--text-color) p-4 sm:p-6 rounded-custom shadow-custom flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mt-2">
        <div className="flex items-center sm:items-start gap-4">
          <div className="w-12 relative overflow-hidden h-12 sm:w-14 sm:h-14 bg-(--main-light) text-(--main-emphasis) rounded-full flex items-center justify-center shrink-0">
            <Image
              src={
                property?.property_logo?.[0]
                  ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${property.property_logo[0]}`
                  : "/img/default-images/yp-institutes.webp"
              }
              alt={property?.property_name || "Property Logo"}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col">
            <Link
              href={`/${generateSlug(property?.category)}/${
                property.property_slug
              }/overview`}
              className="sub-heading font-semibold text-(--text-color-emphasis) hover:text-(--main) line-clamp-1"
            >
              {property?.property_name}
            </Link>

            {(() => {
              const locationParts = [
                property?.property_city,
                property?.property_state,
              ].filter(Boolean);
              if (locationParts.length === 0) return null;

              return (
                <div className="flex items-center gap-1 ms-2">
                  <LuMap className="w-4 h-4 text-(--main)" />
                  <h2 className="heading-sm">{locationParts.join(", ")}</h2>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:self-end justify-end sm:justify-start">
          <LuLandmark className="w-3 h-3 sm:w-6 sm:h-6" />
          <h3 className="text-xs sm:text-lg font-bold">{property?.category}</h3>
        </div>
      </div>
    </section>
  );
}
