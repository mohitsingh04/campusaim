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
    news_slug: string;
  }>;
}): Promise<Metadata> {
  const { news_slug } = await params;
  let news_and_updates = null;

  try {
    const res = await API.get(`/news-and-updates/seo/${news_slug}`, {
      headers: { origin: BASE_URL },
    });
    news_and_updates = res.data;
  } catch (error) {
    getErrorResponse(error, true);
  }

  if (!news_and_updates) {
    return { title: "News Not Found" };
  }

  const keywords =
    news_and_updates?.seo?.primary_focus_keyword?.length > 0
      ? extractKeywords(news_and_updates?.seo?.primary_focus_keyword)
      : [news_and_updates?.title];

  return {
    title: news_and_updates.title,
    description:
      stripHtml(news_and_updates?.seo?.meta_description, 160) ||
      stripHtml(news_and_updates?.content, 160) ||
      "Discover a peaceful yoga Studio with expert instructors, calming ambience, and classes for all levels. Reconnect your mind, body, and soul.",
    keywords,
    alternates: {
      canonical: `${BASE_URL}/news-and-updates/${news_and_updates?.seo?.slug}`,
    },
    openGraph: {
      title: news_and_updates.title,
      description:
        stripHtml(news_and_updates?.seo?.meta_description, 160) ||
        stripHtml(news_and_updates?.content, 160) ||
        "Discover a peaceful yoga Studio with expert instructors, calming ambience, and classes for all levels. Reconnect your mind, body, and soul.",
      images: news_and_updates.featured_image?.[0]
        ? [
            {
              url: `${MEDIA_URL}/${news_and_updates.featured_image[0]}`,
              alt: news_and_updates.title || "news_and_updates Image",
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
