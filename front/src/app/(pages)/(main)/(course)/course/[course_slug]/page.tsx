import FaqJsonSchema from "@/components/json_schemas/FaqJsonSchema";
import API from "@/context/API";
import {
  extractKeywords,
  generateSlug,
  getErrorResponse,
  stripHtml,
} from "@/context/Callbacks";
import CourseDetailSkeleton from "@/ui/loader/page/courses/CourseDetailSkeleton";
import { Metadata } from "next";
import React from "react";
import CourseCard from "./_course_compoents/CourseCard";
import CourseInfoGrid from "./_course_compoents/CourseInfoGrid";
import HeadingLine from "@/ui/headings/HeadingLine";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import FaqComponents from "@/ui/accordions/FaqComponents";
import CourseEnquiryForm from "./_course_compoents/CourseEnquiryForm";
import CoursePropertDetails from "./_course_compoents/CoursePropertDetails";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;
const DEFAULT_IMAGE = `${BASE_URL}/img/default-images/campusaim-courses-featured.png`;

async function getCourseData(slug: string) {
  try {
    const res = await API.get(`/course/seo/${slug}`, {
      headers: { origin: BASE_URL },
    });
    return res.data;
  } catch (error) {
    getErrorResponse(error, true);
    return null;
  }
}

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

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ course_slug: string }>;
}) {
  let loading = true;
  const { course_slug } = await params;
  const course = await getCourseData(course_slug);
  loading = false;
  if (loading) return <CourseDetailSkeleton />;
  return (
    <div className="bg-(--secondary-bg) text-(--text-color) py-6 px-2 sm:px-8">
      <FaqJsonSchema
        faqs={course?.faqs || []}
        slug={course?.course_slug || ""}
      />
      <div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="order-1 lg:order-2 stick top-12">
          <CourseCard course={course} />
        </div>
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <h1 className="heading font-extrabold text-(--text-color-emphasis) mb-4 hidden md:block">
            {course?.course_name}
            {course?.course_short_name && ` - (${course?.course_short_name})`}
          </h1>
          <CourseInfoGrid course={course} />
          <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
            <HeadingLine title="Overview" />
            <ReadMoreLess html={course?.description || ""} />
          </div>

          {(course?.faqs?.length || 0) > 0 && (
            <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
              <HeadingLine title="Frequently Asked Questions" />
              <FaqComponents faqs={course?.faqs || []} />
            </div>
          )}

          <CourseEnquiryForm course={course} />
        </div>
      </div>
      <CoursePropertDetails course={course} />
    </div>
  );
}
