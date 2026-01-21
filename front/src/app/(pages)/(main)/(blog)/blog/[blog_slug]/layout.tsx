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
    blog_slug: string;
  }>;
}): Promise<Metadata> {
  const { blog_slug } = await params;
  let blog = null;

  try {
    const res = await API.get(`/blog/seo/${blog_slug}`, {
      headers: { origin: BASE_URL },
    });
    blog = res.data;
  } catch (error) {
    getErrorResponse(error, true);
  }

  if (!blog) {
    return { title: "blog Not Found" };
  }

  const keywords =
    blog?.seo?.primary_focus_keyword?.length > 0
      ? extractKeywords(blog?.seo?.primary_focus_keyword)
      : [blog?.title];

  return {
    title: blog.title,
    description:
      stripHtml(blog?.seo?.meta_description, 160) ||
      stripHtml(blog?.blog, 160) ||
      "Discover a peaceful yoga Studio with expert instructors, calming ambience, and classes for all levels. Reconnect your mind, body, and soul.",
    keywords,
    alternates: {
      canonical: `${BASE_URL}/blog/${blog?.seo?.slug}`,
    },
    openGraph: {
      title: blog.title,
      description:
        stripHtml(blog?.seo?.meta_description, 160) ||
        stripHtml(blog?.blog, 160) ||
        "Discover a peaceful yoga Studio with expert instructors, calming ambience, and classes for all levels. Reconnect your mind, body, and soul.",
      images: blog.featured_image?.[0]
        ? [
            {
              url: `${MEDIA_URL}/blogs/${blog.featured_image[0]}`,
              alt: blog.title || "blog Image",
            },
          ]
        : undefined,
    },
  };
}

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}
