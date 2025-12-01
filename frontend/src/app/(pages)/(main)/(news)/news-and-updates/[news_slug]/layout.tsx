import API from "@/contexts/API";
import { extractKeywords, generateSlug, stripHtml } from "@/contexts/Callbacks";
import { AxiosError } from "axios";
import { Metadata } from "next";
import React from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    news_slug: string;
  }>;
}): Promise<Metadata> {
  const { news_slug } = await params;
  let property = null;

  try {
    const res = await API.get(`/news-and-updates/seo/${news_slug}`, {
      headers: { origin: BASE_URL },
    });
    property = res.data;
  } catch (error) {
    const err = error as AxiosError<{ error: string }>;
    console.log(err.response?.data.error);
  }

  if (!property) {
    return { title: "Property Not Found" };
  }

  const keywords =
    property?.seo?.primary_focus_keyword?.length > 0
      ? extractKeywords(property?.seo?.primary_focus_keyword)
      : [property?.title];

  return {
    title: property.title,
    description:
      stripHtml(property?.seo?.meta_description, 160) ||
      stripHtml(property?.content, 160) ||
      "Discover a peaceful yoga Studio with expert instructors, calming ambience, and classes for all levels. Reconnect your mind, body, and soul.",
    keywords,
    alternates: {
      canonical: `${BASE_URL}/news-and-updates/${
        property?.seo?.slug
          ? property?.seo?.slug
          : generateSlug(property?.title)
      }`,
    },
    openGraph: {
      title: property.title,
      description:
        stripHtml(property?.seo?.meta_description, 160) ||
        stripHtml(property?.content, 160) ||
        "Discover a peaceful yoga Studio with expert instructors, calming ambience, and classes for all levels. Reconnect your mind, body, and soul.",
      images: property.featured_image?.[0]
        ? [
            {
              url: `${MEDIA_URL}/${property.featured_image[0]}`,
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
