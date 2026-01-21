import API from "@/context/API";
import {
  extractKeywords,
  getErrorResponse,
  stripHtml,
} from "@/context/Callbacks";
import { Metadata } from "next";
import React from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    event_slug: string;
  }>;
}): Promise<Metadata> {
  const { event_slug } = await params;
  let property = null;

  try {
    const res = await API.get(`/event/seo/${event_slug}`, {
      headers: { origin: BASE_URL },
    });
    property = res.data;
  } catch (error) {
    getErrorResponse(error, true);
  }

  if (!property) {
    return { title: "Event Not Found" };
  }

  const keywords =
    property?.seo?.primary_focus_keyword?.length > 0
      ? extractKeywords(property?.seo?.primary_focus_keyword)
      : [property?.title];

  return {
    title: property.title,
    description:
      stripHtml(property?.seo?.meta_description, 160) ||
      stripHtml(property?.description, 160) ||
      "Discover a peaceful yoga Studio with expert instructors, calming ambience, and classes for all levels. Reconnect your mind, body, and soul.",
    keywords,
    alternates: {
      canonical: `${BASE_URL}/event/${property?.seo?.slug}`,
    },
    openGraph: {
      title: property.title,
      description:
        stripHtml(property?.seo?.meta_description, 160) ||
        stripHtml(property?.description, 160) ||
        "Discover a peaceful yoga Studio with expert instructors, calming ambience, and classes for all levels. Reconnect your mind, body, and soul.",
      images: property.featured_image?.[0]
        ? [
            {
              url: `${MEDIA_URL}/events/${property.featured_image[0]}`,
              alt: property.title || "Property Image",
            },
          ]
        : undefined,
    },
  };
}

export default function NewsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}
