"use client";

import React, { useCallback, useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { BiCalendar } from "react-icons/bi";
import {
  formatDate,
  getErrorResponse,
  getUserAvatar,
} from "@/context/Callbacks";
import API from "@/context/API";
import { BsClock } from "react-icons/bs";
import { formatDistanceToNow } from "date-fns";
import { UserProps } from "@/types/UserTypes";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { NewsProps } from "@/types/NewsTypes";
import RelatedNews from "../_news_components/RelatedNews";
import NewsDetialSkeleton from "@/ui/loader/page/news-and-updates/NewsDetialSkeleton";

const NewsDetailPage: React.FC = () => {
  const { news_slug } = useParams();
  const [blog, setNews] = useState<NewsProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProps | null>(null);

  const getNews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/news-and-updates/seo/${news_slug}`);
      const data = response.data;

      if (!data) return setNews(null);

      const finalBlog: NewsProps = { ...data, news_slug: data.slug };

      setNews(finalBlog);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [news_slug]);

  useEffect(() => {
    getNews();
  }, [getNews]);

  const getUser = useCallback(async () => {
    if (!blog?.author) return;
    try {
      const response = await API.get(`/profile/user/${blog?.author}`);
      setUser(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [blog?.author]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  useEffect(() => {
    if (!loading && !blog) {
      notFound();
    }
  }, [loading, blog]);

  const safeCreatedAt = blog?.createdAt ? new Date(blog.createdAt) : null;

  const featuredImageUrl = blog?.featured_image?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/news-and-updates/${blog.featured_image[0]}`
    : "/img/default-images/yp-news.webp";

  if (loading) return <NewsDetialSkeleton />;
  return (
    <div className="bg-(--secondary-bg) py-6">
      <div className="mx-auto px-2 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <article className="bg-(--primary-bg) text-(--text-color) rounded-custom shadow-custom overflow-hidden">
              <div className="relative w-full aspect-2/1">
                <Image
                  src={featuredImageUrl}
                  alt={blog?.title || ""}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <div className="p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
                  <div className="flex items-center space-x-1 ml-auto">
                    <BiCalendar className="h-4 w-4 text-(--main)" />
                    <p className="text-sm">
                      {formatDate(blog?.createdAt || "")}
                    </p>
                  </div>

                  {safeCreatedAt && (
                    <div className="flex items-center space-x-1">
                      <BsClock className="h-4 w-4 text-(--main)" />
                      <p>
                        {formatDistanceToNow(safeCreatedAt, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <h1 className="heading-lg text-(--text-color-emphasis) font-extrabold leading-tight mb-3">
                  {blog?.title}
                </h1>

                <div id="blog-main">
                  <ReadMoreLess html={blog?.content} />
                </div>
              </div>
            </article>

            {/* Author Section */}
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
                <p>Yoga & Wellness Expert</p>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1 space-y-6">
            <RelatedNews news={blog} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;
