import React, { Suspense } from "react";
import Pagination from "../../../../../ui/pagination/Pagination";
import { formatDate, formatTime, stripHtmlAndLimit } from "@/context/Callbacks";
import API from "@/context/API";
import { NewsProps } from "@/types/NewsTypes";
import Link from "next/link";
import BlogCourse from "../../(blog)/blog/_allblog_components/BlogCourses";
import RelatedBlogs from "../../(blog)/blog/_allblog_components/RelatedBlogs";
import Image from "next/image";
import NewsListSkeleton from "@/ui/loader/page/news-and-updates/NewslistSkeleton";
import { SearchIcon } from "lucide-react";
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://campusaim.com";

const title = "News and Updates";
const keywords = [
  "education news",
  "college news",
  "university updates",
  "exam updates",
  "school news",
];
const description =
  "Stay updated with the latest education news, college updates, admission alerts, exam notifications & academic trends on Campusaim News.";
const canonical = "/news-and-updates";
const featuredImage = [
  {
    url: "/img/main-images/campusaim.png",
    width: 1200,
    height: 700,
    alt: "News and Update",
  },
];
export const metadata: Metadata = {
  title: title,
  description: description,
  keywords: keywords,
  metadataBase: new URL(baseUrl),
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

const headers = { origin: baseUrl };

async function getNewsData() {
  try {
    const [allNewsRes, allNewsSeoRes] = await Promise.all([
      API.get(`/news-and-updates`, { headers }),
      API.get("/all/seo?type=news", { headers }),
    ]);

    const allNewsData = allNewsRes?.data || [];
    const seoData = allNewsSeoRes?.data || [];

    const validNews = allNewsData?.filter(
      (item: NewsProps) =>
        item?.status === "Published" &&
        seoData.some((seo: any) => seo.news_id === item._id),
    );

    const enriched = validNews.map((item: NewsProps) => {
      const seoMatch = seoData.find((seo: any) => seo.news_id === item._id);
      return { ...item, news_slug: seoMatch.slug };
    });

    return enriched;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

const NewsPage = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const newsPerPage = 6;
  const currentPage = Number(params.page || 1);

  const news: NewsProps[] = await getNewsData();

  const totalPages = Math.ceil(news.length / newsPerPage);
  const startIndex = (currentPage - 1) * newsPerPage;
  const currentNews = news.slice(startIndex, startIndex + newsPerPage);

  return (
    <div>
      <div className="bg-(--secondary-bg) py-6 sm:px-8 p-2">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="w-full md:w-2/3">
            <Suspense fallback={<NewsListSkeleton />}>
              {currentNews.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {currentNews.map((article, index) => (
                    <MainArticle key={article._id || index} article={article} />
                  ))}
                </div>
              ) : (
                <NoNewsFound />
              )}

              {news.length > newsPerPage && (
                <div className="mt-4">
                  <Pagination
                    classnames="justify-start bg-transparent"
                    totalPages={totalPages}
                    currentPage={currentPage}
                  />
                </div>
              )}
            </Suspense>
          </main>
          <aside className="lg:col-span-1 space-y-6">
            <BlogCourse />
            <RelatedBlogs />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;

const MainArticle = ({ article }: { article: NewsProps }) => (
  <article className="py-6 bg-(--primary-bg) text-(--text-color) px-3 shadow-custom rounded-custom">
    <div className="flex flex-col-reverse sm:flex-row gap-4">
      <div className="flex-1">
        <h2 className="heading font-semibold mb-2 leading-tight">
          <Link
            href={`/news-and-updates/${article.news_slug}`}
            className="hover:text-(--main) text-(--text-color-emphasis) cursor-pointer"
          >
            {article.title}
          </Link>
        </h2>
        <p className="mb-2">{stripHtmlAndLimit(article.content)}</p>
        <p className="font-semibold text-sm">
          Updated On: {formatDate(article.createdAt)} |{" "}
          {formatTime(article.createdAt)}
        </p>
      </div>

      <div className="relative w-full sm:w-52 aspect-video shrink-0 border border-(--border) p-1 rounded-custom">
        <Image
          src={
            article?.featured_image?.[0]
              ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/news-and-updates/${article.featured_image[0]}`
              : "/img/default-images/campusaim-courses-featured.png"
          }
          alt={article.title || "Article thumbnail"}
          fill
          sizes="(max-width: 640px) 100vw, 208px"
          className="object-cover rounded-md"
        />
      </div>
    </div>
  </article>
);

const NoNewsFound = () => (
  <div className="text-center py-16 bg-(--primary-bg) rounded-custom shadow-custom">
    <div className="max-w-md mx-auto">
      <div className="w-24 h-24 bg-(--main-emphasis) rounded-full flex items-center justify-center mx-auto mb-4">
        <SearchIcon className="h-12 w-12 text-(--main-subtle)" />
      </div>
      <h3 className="heading font-semibold text-(--text-color-emphasis) mb-2">
        No news found
      </h3>
      <p className="text-(--text-color) mb-4">Try adjusting your search.</p>
    </div>
  </div>
);
