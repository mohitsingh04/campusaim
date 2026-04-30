import { getCountryCode } from "@/lib/getCountryCode";
import { PropertyProps } from "@/types/PropertyTypes";
import Script from "next/script";
import React from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;
const DEFAULT_IMAGE = `${BASE_URL}/img/default-images/yp-institutes.webp`;

interface JsonLdSchema {
  "@context": string;
  "@type": string;
  itemReviewed: {
    "@type": string;
    image: string;
    name: string | undefined;
  };
  ratingValue: number | string;
  ratingCount: number;
  address?: {
    "@type": string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
}

export default function PropertyJsonSchemaHandler({
  property_slug,
  property,
}: {
  property_slug: string;
  property: PropertyProps | null;
}) {
  const ogImage = property?.featured_image?.[0]
    ? `${MEDIA_URL}/${property.featured_image[0]}`
    : DEFAULT_IMAGE;

  const jsonLd: JsonLdSchema = {
    "@context": "https://schema.org/",
    "@type": "AggregateRating",
    itemReviewed: {
      "@type": "LocalBusiness",
      image: ogImage,
      name: property?.property_name,
    },
    ratingValue: property?.average_rating || 0,
    ratingCount: property?.total_reviews || 0,
  };

  if (
    property?.property_address &&
    property?.property_city &&
    property?.property_state &&
    property?.property_pincode &&
    property?.property_country
  ) {
    jsonLd.address = {
      "@type": "PostalAddress",
      streetAddress: property?.property_address || "",
      addressLocality: property?.property_city || "",
      addressRegion: property?.property_state || "",
      postalCode: property?.property_pincode || "",
      addressCountry: getCountryCode(property?.property_country || ""),
    };
  }
  return (
    <div>
      {property?.property_slug === property_slug && (
        <Script
          id={`json-ld-${property?.property_slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </div>
  );
}
