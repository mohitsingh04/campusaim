import API from "@/context/API";
import {
  extractKeywords,
  formatDate,
  getErrorResponse,
  getUserAvatar,
  stripHtml,
} from "@/context/Callbacks";
import { getUserById } from "@/lib/Fetch-User";
import NewsDetialSkeleton from "@/ui/loader/page/news-and-updates/NewsDetialSkeleton";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { Metadata } from "next";
import Image from "next/image";
import React from "react";
import RelatedNews from "../_news_components/RelatedNews";
import BlogCourse from "../../../(blog)/blog/_allblog_components/BlogCourses";
import RelatedBlogs from "../../../(blog)/blog/_allblog_components/RelatedBlogs";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import HeadingLine from "@/ui/headings/HeadingLine";
import FaqComponents from "@/ui/accordions/FaqComponents";
import FaqJsonSchema from "@/components/json_schemas/FaqJsonSchema";
import { NewsProps } from "@/types/NewsTypes";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;
const DEFAULT_IMAGE = `${BASE_URL}/img/default-images/campusaim-courses-featured.png`;

async function getNewsData(blog_slug: string) {
  try {
    const res = await API.get(`/news-and-updates/seo/${blog_slug}`, {
      headers: { origin: BASE_URL },
    });
    return res.data as NewsProps;
  } catch (error) {
    getErrorResponse(error, true);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    news_slug: string;
  }>;
}): Promise<Metadata> {
  const { news_slug } = await params;
  const news_and_updates = await getNewsData(news_slug);

  if (!news_and_updates) {
    return { title: "Latest Education News & Updates" };
  }

  const title = news_and_updates.title;
  const description =
    (news_and_updates?.seo?.meta_description
      ? stripHtml(news_and_updates?.seo?.meta_description, 160)
      : stripHtml(news_and_updates?.content, 160)) ||
    "Read the latest update on this page. Get education news, admission alerts, college updates & academic insights from Campusaim.";
  const keywords =
    (news_and_updates?.seo?.primary_focus_keyword?.length || 0) > 0
      ? extractKeywords(news_and_updates?.seo?.primary_focus_keyword)
      : [
          news_and_updates?.title,
          "News India",
          "college news",
          "university news",
        ];
  const canonical = `${BASE_URL}/news-and-updates/${news_and_updates?.seo?.slug}`;

  const ogImage = news_and_updates.featured_image?.[0]
    ? `${MEDIA_URL}/news-and-updates/${news_and_updates.featured_image?.[0]}`
    : DEFAULT_IMAGE;

  const featuredImage = [
    {
      url: ogImage,
      width: 1200,
      height: 700,
      alt: title || "News Featured Image",
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
export default async function NewsLayout({
  params,
}: {
  params: Promise<{
    news_slug: string;
  }>;
}) {
  let loading = true;
  const { news_slug } = await params;
  const news = await getNewsData(news_slug);
  const user = await getUserById(news?.author || "");

  const safeCreatedAt = news?.createdAt ? new Date(news.createdAt) : null;

  const featuredImageUrl = news?.featured_image?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/news-and-updates/${news.featured_image[0]}`
    : "/img/default-images/campusaim-courses-featured.png";

  loading = false;
  if (loading) return <NewsDetialSkeleton />;

  return (
    <div className="bg-(--secondary-bg) py-6">
      <FaqJsonSchema faqs={news?.faqs || []} slug={news_slug} />
      <div className="mx-auto px-2 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <article className="bg-(--primary-bg) text-(--text-color) rounded-custom shadow-custom overflow-hidden">
              <div className="relative w-full aspect-2/1">
                <Image
                  src={featuredImageUrl}
                  alt={news?.title || ""}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <div className="p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
                  <div className="flex items-center space-x-1 ml-auto">
                    <CalendarIcon className="h-4 w-4 text-(--main)" />
                    <p className="text-sm">
                      {formatDate(news?.createdAt || "")}
                    </p>
                  </div>

                  {safeCreatedAt && (
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4 text-(--main)" />
                      <p>
                        {formatDistanceToNow(safeCreatedAt, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <h1 className="heading-lg text-(--text-color-emphasis) font-extrabold leading-tight mb-3">
                  {news?.title}
                </h1>

                <div id="blog-main">
                  <ReadMoreLess html={news?.content || ""} />
                </div>
                {news?.faqs && news.faqs.length > 0 && (
                  <div className="mt-8 pt-5 border-t border-(--border)">
                    <HeadingLine title="Frequently Asked Questions" />
                    <div className="space-y-3 mt-4">
                      <FaqComponents faqs={news?.faqs || []} />
                    </div>
                  </div>
                )}
              </div>
            </article>

            <div className="bg-(--primary-bg) text-(--text-color) rounded-custom p-5 gap-5 md:flex items-center shadow-custom flex">
              <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto md:mx-0 shrink-0">
                <Image
                  src={getUserAvatar(user?.avatar || [])}
                  alt={user?.name || "Author"}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-(--text-color-emphasis)">
                  Written By : {user?.name}
                </h3>
                <p>Education Content Specialist</p>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1 space-y-6">
            <RelatedNews news={news} />
            <BlogCourse />
            <RelatedBlogs />
          </aside>
        </div>
      </div>
    </div>
  );
}
