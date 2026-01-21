import API from "@/context/API";
import {
  extractKeywords,
  generateSlug,
  getErrorResponse,
  stripHtml,
} from "@/context/Callbacks";
import CourseDetailSkeleton from "@/ui/loader/page/courses/CourseDetailSkeleton";
import { Metadata } from "next";
import React, { Suspense } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    course_slug: string;
  }>;
}): Promise<Metadata> {
  const { course_slug } = await params;
  let property = null;

  try {
    const res = await API.get(`/course/seo/${course_slug}`, {
      headers: { origin: BASE_URL },
    });
    property = res.data;
  } catch (error) {
    getErrorResponse(error, true);
  }

  if (!property) {
    return { title: "Course Not Found" };
  }

  const keywords =
    property?.seo?.primary_focus_keyword?.length > 0
      ? extractKeywords(property?.seo?.primary_focus_keyword)
      : [property?.title];

  return {
    title: property.course_name,
    description:
      stripHtml(property?.seo?.meta_description, 160) ||
      stripHtml(property?.description, 160) ||
      "Discover a peaceful yoga Studio with expert instructors, calming ambience, and classes for all levels. Reconnect your mind, body, and soul.",
    keywords,
    alternates: {
      canonical: `${BASE_URL}/course/${
        property?.seo?.slug
          ? property?.seo?.slug
          : generateSlug(property?.course_name)
      }`,
    },
    openGraph: {
      title: property.course_name,
      description:
        stripHtml(property?.seo?.meta_description, 160) ||
        stripHtml(property?.description, 160) ||
        "Discover a peaceful yoga Studio with expert instructors, calming ambience, and classes for all levels. Reconnect your mind, body, and soul.",
      images: property.image?.[0]
        ? [
            {
              url: `${MEDIA_URL}/course/${property.image[0]}`,
              alt: property.course_name || "Property Image",
            },
          ]
        : undefined,
    },
  };
}

export default function CourseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Suspense fallback={<CourseDetailSkeleton />}>{children}</Suspense>;
}
