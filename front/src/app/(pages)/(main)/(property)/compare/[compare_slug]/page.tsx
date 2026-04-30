import { Metadata } from "next";
import { redirect } from "next/navigation";
import { PropertyProps } from "@/types/PropertyTypes";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import CompareProperties from "./CompareProperties";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const DEFAULT_IMAGE = `${BASE_URL}/img/main-images/campusaim.png`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ compare_slug: string }>;
}): Promise<Metadata> {
  const { compare_slug } = await params;

  const defaultMeta: Metadata = {
    title: "Compare Colleges, Universities, Schools & Academies",
    description:
      "Compare colleges, universities, schools & academies across India. Explore fees, courses, placements and more to find the right institute for your career with Campus Aim",
    keywords: [
      "compare colleges india",
      "college comparison tool",
      "compare universities",
      "compare schools",
      "best college comparison",
    ],
    alternates: {
      canonical: `${BASE_URL}/compare/select`,
    },
    openGraph: {
      title: "Compare Colleges, Universities, Schools & Academies",
      description:
        "Compare colleges, universities, schools & academies across India. Explore fees, courses, placements and more to find the right institute for your career with Campus Aim",
      url: `${BASE_URL}/compare/select`,
      type: "website",
    },
  };

  if (!compare_slug || compare_slug === "select") {
    return defaultMeta;
  }

  const slugsArray = compare_slug.split("-vs-");

  if (slugsArray.length > 3) {
    const trimmed = slugsArray.slice(0, 3);
    const newSlug = trimmed.join("-vs-");
    redirect(`/compare/${newSlug}`);
  }

  const properties: PropertyProps[] = [];

  for (const slug of slugsArray) {
    try {
      const res = await API.get(`/property/slug/${slug}`, {
        headers: { origin: BASE_URL },
      });

      if (res?.data) properties.push(res.data);
    } catch (error) {
      getErrorResponse(error);
    }
  }

  if (properties.length === 0) {
    return defaultMeta;
  }
  const title =
    properties.length === 1
      ? properties[0].property_name
      : properties.map((p) => p.property_name).join(" vs ");
  const description =
    properties.length === 1
      ? `Compare ${properties[0].property_name} with other institutes on campusaim. Check courses, location, pricing, and reviews before choosing the right Education.`
      : `Compare ${properties
          .map((p) => p.property_name)
          .join(
            " vs ",
          )}. Explore fees, courses, locations, and reviews to choose the right institute.`;
  const keywords = [
    ...properties.map((p) => p.property_name),
    "college comparison tool",
  ];
  const canonical = `${BASE_URL}/compare/${compare_slug}`;

  const featuredImage = [
    {
      url: DEFAULT_IMAGE,
      width: 1200,
      height: 700,
      alt: title || "Property Featured Image",
    },
  ];
  return {
    title: title,
    description: description,
    keywords: keywords,
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: title,
      description: description,
      url: canonical,
      siteName: "Campusaim",
      images: featuredImage,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: featuredImage,
    },
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ compare_slug: string }>;
}) {
  const { compare_slug } = await params;

  let slugsArray: string[] = [];

  if (compare_slug && compare_slug !== "select") {
    slugsArray = compare_slug.split("-vs-");

    if (slugsArray.length > 3) {
      const trimmedSlugs = slugsArray.slice(0, 3);
      const newSlug = trimmedSlugs.join("-vs-");
      redirect(`/compare/${newSlug}`);
    }
  }

  return <CompareProperties slugs={slugsArray} />;
}
