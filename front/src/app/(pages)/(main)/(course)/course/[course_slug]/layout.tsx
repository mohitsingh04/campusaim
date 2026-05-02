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
const DEFAULT_IMAGE = `${BASE_URL}/img/main-images/campusaim.png`;

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
    return { title: "Course Details for all college and university" };
  }

  const title = property.course_name;
  const description =
    stripHtml(property?.seo?.meta_description, 160) ||
    stripHtml(property?.description, 160) ||
    "Explore course details including eligibility, fees, admission process, duration, syllabus, career opportunities, and top colleges & universities at Campusaim.";
  const keywords =
    property?.seo?.primary_focus_keyword?.length > 0
      ? extractKeywords(property?.seo?.primary_focus_keyword)
      : [title, "college courses", "university courses"];
  const canonical = `${BASE_URL}/course/${
    property?.seo?.slug
      ? property?.seo?.slug
      : generateSlug(property?.course_name)
  }`;

  const ogImage = property?.image?.[0]
    ? `${MEDIA_URL}/course/${property?.image?.[0]}`
    : DEFAULT_IMAGE;

  const featuredImage = [
    {
      url: ogImage,
      width: 1200,
      height: 700,
      alt: title || "Course Featured Image",
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
      siteName: "Yogprerna",
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

export default function CourseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Suspense fallback={<CourseDetailSkeleton />}>{children}</Suspense>;
}
