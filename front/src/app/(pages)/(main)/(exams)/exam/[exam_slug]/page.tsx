import FaqJsonSchema from "@/components/json_schemas/FaqJsonSchema";
import ExamDetails from "./ExamPage";
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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;
const DEFAULT_IMAGE = `${BASE_URL}/img/main-images/campusaim.png`;

async function getExamData(slug: string) {
  try {
    const res = await API.get(`/exam/seo/${slug}`, {
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
    exam_slug: string;
  }>;
}): Promise<Metadata> {
  const { exam_slug } = await params;
  let property = null;

  try {
    const res = await API.get(`/exam/seo/${exam_slug}`, {
      headers: { origin: BASE_URL },
    });
    property = res.data;
  } catch (error) {
    getErrorResponse(error, true);
  }

  if (!property) {
    return { title: "Entrance Exam Information" };
  }

  const title = property.exam_name;
  const description =
    stripHtml(property?.seo?.meta_description, 160) ||
    stripHtml(property?.description, 160) ||
    "Get complete entrance exam information, including eligibility, syllabus, exam pattern, application process, important dates, admit card, results, and counselling updates.";
  const keywords =
    property?.seo?.primary_focus_keyword?.length > 0
      ? extractKeywords(property?.seo?.primary_focus_keyword)
      : [title, "entrance exam details", "admission course details"];
  const canonical = `${BASE_URL}/exam/${
    property?.seo?.slug
      ? property?.seo?.slug
      : generateSlug(property?.course_name)
  }`;

  const ogImage = property?.image?.[0]
    ? `${MEDIA_URL}/exam/${property?.image?.[0]}`
    : DEFAULT_IMAGE;

  const featuredImage = [
    {
      url: ogImage,
      width: 1200,
      height: 700,
      alt: title || "Exam Featured Image",
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

export default async function ExamLayout({
  params,
}: {
  params: Promise<{
    exam_slug: string;
  }>;
}) {
  let loading = true;
  const { exam_slug } = await params;
  const exam = await getExamData(exam_slug);
  loading = false;
  if (loading) return <CourseDetailSkeleton />;

  return (
    <div className="bg-(--secondary-bg) text-(--text-color) py-6 px-2 sm:px-8">
      <FaqJsonSchema faqs={exam?.faqs || []} slug={`${exam_slug}`} />
      <ExamDetails exam={exam} />
    </div>
  );
}
