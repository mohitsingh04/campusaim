import { Metadata } from "next";
import React, { ReactNode } from "react";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const DEFAULT_IMAGE = `${BASE_URL}/img/default-images/yp-institutes.webp`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    category: string;
  }>;
}): Promise<Metadata> {
  const { category } = await params;

  const property_tab_capitalize = category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const meta_title = property_tab_capitalize;
  const keywords = [meta_title];
  const description = `Explore the best ${property_tab_capitalize} with Campusaim. Find top colleges, courses, admissions, and career opportunities in one place.`;

  const canonical = `${BASE_URL}/${category}`;

  const featuredImage = [
    {
      url: DEFAULT_IMAGE,
      width: 1200,
      height: 700,
      alt: meta_title || "Property Featured Image",
    },
  ];
  return {
    title: meta_title,
    description: description,
    keywords: keywords,
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: meta_title,
      description: description,
      url: canonical,
      siteName: "Campusaim",
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

export default function layout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
