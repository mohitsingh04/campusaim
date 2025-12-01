"use client";
import React, { useCallback, useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import Breadcrumb from "@/components/breadcrumbs/breadcrumbs";
import API from "@/contexts/API";
import { UserProps, NewsProps } from "@/types/types";
import { generateSlug } from "@/contexts/Callbacks";
import Sidebar from "./_news_components/sidebar";
import BlogDetailLoader from "@/components/Loader/Blog/BlogDetailLoader";
import Image from "next/image";

const NewsDetailPage: React.FC = () => {
  const { news_slug } = useParams();
  const [news, setNews] = useState<NewsProps | null>(null);
  const [author, setAuthor] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [allNews, setAllNews] = useState<NewsProps[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get("/profile/users");
      return res.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  const getNews = useCallback(
    async (users: UserProps[]) => {
      setLoading(true);
      try {
        const response = await API.get("/news-and-updates");
        const data: NewsProps[] = response.data.filter(
          (item: NewsProps) => item.status === "Published"
        );
        setAllNews(data);

        const mainNews = data.find(
          (item) => generateSlug(item?.title) === news_slug
        );
        if (!mainNews) return;

        setNews(mainNews);

        if (mainNews.author) {
          const authorData = users.find((u) => u._id === mainNews.author);
          setAuthor(authorData || null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [news_slug]
  );

  useEffect(() => {
    const init = async () => {
      const users = await fetchUsers();
      await getNews(users);
    };
    init();
  }, [fetchUsers, getNews]);

  useEffect(() => {
    if (!news || news?.status?.toLowerCase() !== "published") {
      if (!loading) {
        notFound();
      }
    }
  }, [news, loading]);

  return (
    <>
      {!loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/news-and-updates"
              className="inline-flex items-center space-x-2 text-purple-600 transition-colors group"
            >
              <LuArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Back to News</span>
            </Link>
          </div>

          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb
              items={[
                { label: "News & Updates", path: "/news-and-updates" },
                { label: news?.title || "News" },
              ]}
            />
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Featured Image */}
                <div className="relative w-full aspect-[2/1]">
                  <Image
                    src={
                      news?.featured_image?.[0]
                        ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/news-and-updates/${news.featured_image[0]}`
                        : "/img/default-images/yp-news.webp"
                    }
                    alt={news?.title || "News Featured"}
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                </div>

                <div className="p-8">
                  {/* Title */}
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {news?.title}
                  </h1>

                  {/* Description */}
                  <div
                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed mb-6"
                    dangerouslySetInnerHTML={{ __html: news?.content || "" }}
                  />
                </div>
              </article>

              {/* Author Section */}
              {author && (
                <div className="bg-white rounded-2xl p-6 md:flex items-start space-x-6 mt-5 shadow-sm">
                  {/* Image */}
                  <div className="flex flex-col items-center justify-center w-32 h-40 mx-auto md:mx-0">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-100 mb-3">
                      <Image
                        src={
                          author.avatar?.[0]
                            ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/user/${author.avatar[0]}`
                            : "/img/default-images/yp-user.webp"
                        }
                        alt={author.name || ""}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-4 md:mt-0 text-center md:text-left flex-1 p-6">
                    <p className="text-sm text-green-600 font-semibold">
                      News Writer
                    </p>
                    <p className="font-medium text-gray-900 my-2">
                      {author.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Sidebar currentNews={news} allNews={allNews} />
            </div>
          </div>
        </div>
      ) : (
        <BlogDetailLoader />
      )}
    </>
  );
};

export default NewsDetailPage;
