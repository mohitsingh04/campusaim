"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { LuSearch } from "react-icons/lu";
import Pagination from "../../../../../ui/pagination/Pagination";
import {
  formatDate,
  formatTime,
  getErrorResponse,
  stripHtmlAndLimit,
} from "@/context/Callbacks";
import API from "@/context/API";
import { NewsProps } from "@/types/NewsTypes";
import Link from "next/link";
import BlogCourse from "../../(blog)/blog/_allblog_components/BlogCourses";
import RelatedBlogs from "../../(blog)/blog/_allblog_components/RelatedBlogs";
import Image from "next/image";
import NewsListSkeleton from "@/ui/loader/page/news-and-updates/NewslistSkeleton";

const NewsPage: React.FC = () => {
  const searchParams = useSearchParams();

  const newsPerPage = 6;

  const currentPage = Number(searchParams.get("page") || 1);

  const [news, setNews] = useState<NewsProps[]>([]);
  const [loading, setLoading] = useState(true);

  // const resetPage = useCallback(() => {
  //   const params = new URLSearchParams(searchParams.toString());
  //   params.set("page", "1");
  //   router.push(`?${params.toString()}`);
  // }, [router, searchParams]);

  const getNews = useCallback(async () => {
    setLoading(true);

    try {
      const [allNewsRes, allNewsSeoRes] = await Promise.allSettled([
        API.get(`/news-and-updates`),
        API.get("/all/seo?type=news"),
      ]);

      if (
        allNewsRes.status === "fulfilled" &&
        allNewsSeoRes.status === "fulfilled"
      ) {
        const allNewsData = allNewsRes?.value?.data || [];
        const seoData = allNewsSeoRes.value.data || [];

        const validNews = allNewsData.filter(
          (item: NewsProps) =>
            item?.status === "Published" &&
            seoData.some((seo: any) => seo.news_id === item._id)
        );

        const enriched = validNews.map((item: NewsProps) => {
          const seoMatch = seoData.find((seo: any) => seo.news_id === item._id);
          return { ...item, news_slug: seoMatch.slug };
        });

        setNews(enriched);
      }
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getNews();
  }, [getNews]);

  const totalPages = Math.ceil(news.length / newsPerPage);
  const startIndex = (currentPage - 1) * newsPerPage;
  const currentNews = news.slice(startIndex, startIndex + newsPerPage);

  if (loading) return <NewsListSkeleton />;

  return (
    <div>
      <div className="bg-(--secondary-bg) py-6 sm:px-8 p-2">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="w-full md:w-2/3">
            {currentNews.length > 0 ? (
              <div className="flex flex-col gap-3">
                {currentNews.map((article, index) => (
                  <MainArticle key={index} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-(--primary-bg) rounded-custom shadow-custom">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-(--main-emphasis) rounded-full flex items-center justify-center mx-auto mb-4">
                    <LuSearch className="h-12 w-12 text-(--main-light)" />
                  </div>

                  <h3 className="heading font-semibold text-(--text-color-emphasis) mb-2">
                    No news found
                  </h3>

                  <p className="text-(--text-color) mb-4">
                    Try adjusting your search.
                  </p>
                </div>
              </div>
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
        <h2 className="heading font-semibold mb-2 leading-tight ">
          <Link
            href={`/news-and-updates/${article.news_slug}`}
            className="hover:text-(--main) text-(--text-color-emphasis) cursor-pointer"
          >
            {article.title}
          </Link>
        </h2>
        <p className="mb-2">{stripHtmlAndLimit(article.content)}</p>
        <p className="font-semibold">
          Updated On: {formatDate(article.createdAt)} |{" "}
          {formatTime(article.createdAt)}
        </p>
      </div>

      <div className="relative w-full sm:w-[210px] aspect-2/1 shrink-0 border border-(--border) p-1 rounded-custom">
        <Image
          src={
            article?.featured_image?.[0]
              ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/news-and-updates/${article.featured_image[0]}`
              : "/img/default-images/yp-newss.webp"
          }
          alt="Article thumbnail"
          fill
          className="object-cover rounded-md"
        />
      </div>
    </div>
  </article>
);
