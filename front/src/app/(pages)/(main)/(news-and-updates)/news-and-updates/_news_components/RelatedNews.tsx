"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import API from "@/context/API";
import { formatDate, getErrorResponse } from "@/context/Callbacks";
import HeadingLine from "@/ui/headings/HeadingLine";
import { NewsProps } from "@/types/NewsTypes";

const RelatedNews = ({ news }: { news?: NewsProps | null }) => {
  const [newsList, setNewsList] = useState<NewsProps[]>([]);

  const getRelatedNews = useCallback(async () => {
    try {
      const [allNewsRes, allNewsSeoRes] = await Promise.allSettled([
        API.get(`/news-and-updates`),
        API.get(`/all/seo?type=news`),
      ]);

      if (
        allNewsRes.status !== "fulfilled" ||
        allNewsSeoRes.status !== "fulfilled"
      ) {
        return;
      }

      const allNews: NewsProps[] = allNewsRes.value.data || [];
      const seoData: any[] = allNewsSeoRes.value.data || [];

      const validNews: NewsProps[] = allNews
        .filter(
          (item: NewsProps) =>
            item?.status === "Published" &&
            seoData.some((seo) => seo.news_id === item._id),
        )
        .map((item: NewsProps) => {
          const seoMatch = seoData.find((seo) => seo.news_id === item._id);
          return { ...item, news_slug: seoMatch?.slug ?? null };
        });

      const otherNews = validNews.filter(
        (item: NewsProps) => item._id !== news?._id,
      );

      const shuffledRelated = [...otherNews].sort(() => Math.random() - 0.5);
      const finalNews = shuffledRelated.slice(0, 5);

      setNewsList(finalNews);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [news]);

  useEffect(() => {
    getRelatedNews();
  }, [getRelatedNews]);

  if (newsList.length <= 0) return;

  return (
    <div className="space-y-4">
      <div className="bg-(--primary-bg) text-(--text-color) rounded-custom shadow-custom p-5">
        <HeadingLine title="Related News" />

        <div className="space-y-4">
          {newsList.map((n) => (
            <Link
              key={n._id}
              href={`/news-and-updates/${n.news_slug}`}
              className="flex space-x-3 group bg-(--secondary-bg) shadow-custom p-2 rounded-custom transition-colors items-center"
            >
              <div className="w-20 aspect-2/1 rounded-custom overflow-hidden shrink-0 relative">
                <Image
                  src={
                    n?.featured_image?.[0]
                      ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/news-and-updates/${n.featured_image[0]}`
                      : "/img/default-images/campusaim-courses-featured.png"
                  }
                  alt={n.title}
                  fill
                  sizes="80px"
                  className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="paragraph font-medium text-(--text-color-emphasis) group-hover:text-(--main) truncate transition-colors">
                  {n.title}
                </h4>

                <p className="text-sm text-gradient font-medium pt-1">
                  {formatDate(n.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedNews;
