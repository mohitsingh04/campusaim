import { stripHtml } from "@/context/Callbacks";
import {
  getPropertyBySlug,
  getPropertyLocation,
  getPropertySeo,
} from "@/lib/Fetch-Property";
import {
  PropertyLocationProps,
  PropertyProps,
  PropertySeoProps,
} from "@/types/PropertyTypes";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React, { ReactNode } from "react";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;

const DEFAULT_IMAGE = `${BASE_URL}/img/default-images/yp-institutes.webp`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    property_slug: string;
    category: string;
    property_tab: string;
    property_asset_slug: string;
  }>;
}): Promise<Metadata> {
  const { property_slug, category, property_tab, property_asset_slug } =
    await params;
  const property: PropertyProps | null = await getPropertyBySlug(property_slug);
  if (!property) return notFound();
  let location: PropertyLocationProps | null = null;
  if (property?._id) location = await getPropertyLocation(property._id);
  let seo: PropertySeoProps | null = null;
  if (property?._id) seo = await getPropertySeo(property._id);

  const property_tab_capitalize =
    property_tab.charAt(0).toUpperCase() + property_tab.slice(1);
  const propertyAssetItem = property_asset_slug
    ?.toString()
    .replace(/-/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const meta_title = location?.property_city
    ? `${propertyAssetItem} ${property_tab_capitalize} | ${property?.property_name} ${location?.property_city}`
    : `${propertyAssetItem} ${property_tab_capitalize} | ${property.property_name}`;

  const baseMetaDescription =
    stripHtml(seo?.meta_description || "", 160) ||
    stripHtml(property?.property_description, 160) ||
    `Explore ${property?.property_name} ${location?.property_city} ${property_tab?.replaceAll("-", " ")} including courses, fees, admission & ranking. Top ranking ${category} with top placements & facilities.`;

  const description = `${property_tab_capitalize} ${baseMetaDescription}`
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  const leadKeyword: string | undefined =
    property_tab === "overview"
      ? property?.property_name
      : `${property_tab_capitalize} ${property?.property_name}`;

  const secondary: string | undefined = (seo?.primary_focus_keyword || []).find(
    (k: string) => k !== property?.property_name,
  );
  const finalKeyword: string[] = [...new Set([leadKeyword, secondary])]
    .filter((k): k is string => Boolean(k))
    .slice(0, 2);

  const ogImage = property.featured_image?.[0]
    ? `${MEDIA_URL}/${property.featured_image[0]}`
    : DEFAULT_IMAGE;

  const canonical = `${BASE_URL}/${category}/${property.property_slug}/${property_tab}/${property_asset_slug}`;

  const featuredImage = [
    {
      url: ogImage,
      width: 1200,
      height: 700,
      alt: property.property_name || "Property Featured Image",
    },
  ];
  return {
    title: meta_title,
    description: description,
    keywords: finalKeyword,
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: meta_title,
      description: description,
      url: canonical,
      siteName: meta_title,
      images: featuredImage,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta_title,
      description: description,
      images: featuredImage,
    },
  };
}

export default function PropertyCourseLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div>{children}</div>;
}
