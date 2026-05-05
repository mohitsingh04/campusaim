"use client";

import { socailLinks } from "@/common/SocailMedaiData";
import Script from "next/script";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.campusaim.com";
const email = process.env.NEXT_PUBLIC_YP_EMAIL;
const phone = process.env.NEXT_PUBLIC_YP_PHONE;

export default function OrganizationSchema() {
  const socialMedia = socailLinks?.map((item: { href: string }) => item?.href);
  const logo = `${baseUrl}/img/logo/campusaim-logo.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Campusaim",
    url: baseUrl,
    logo: logo,
    sameAs: socialMedia,
    email: email,
    telephone: phone,
    description:
      "Discover top colleges, universities, schools & academies in India. Compare courses, fees & locations easily with the Campusaim platform.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dehradun",
      addressCountry: "IN",
      addressRegion: "Uttarakhand",
      postalCode: "248001",
    },
  };

  return (
    <Script
      id="json-ld-organization"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
