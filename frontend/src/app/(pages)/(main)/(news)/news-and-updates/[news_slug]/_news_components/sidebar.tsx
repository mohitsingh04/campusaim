import { formatDate, generateSlug } from "@/contexts/Callbacks";
import { NewsProps } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { LuCalendar, LuTrendingUp } from "react-icons/lu";

const NewsAndUpdates = ({
  currentNews,
  allNews,
}: {
  currentNews?: NewsProps | null;
  allNews: NewsProps[];
}) => {
  const [newsList, setNewsList] = useState<NewsProps[]>([]);

  useEffect(() => {
    if (!allNews.length) return;
    const otherNews = currentNews
      ? allNews.filter((item) => item?._id !== currentNews._id)
      : allNews;

    const shuffled = [...otherNews].sort(() => 0.5 - Math.random());
    setNewsList(shuffled.slice(0, 5));
  }, [currentNews, allNews]);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <LuTrendingUp className="h-5 w-5 text-purple-600" />
          <span>News & Updates</span>
        </h3>

        <div className="space-y-4">
          {newsList.map((news, index) => (
            <Link
              key={index}
              href={`/news-and-updates/${generateSlug(news.title)}`}
              className="flex space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-300 ease-in-out">
                  <Image
                    src={
                      news?.featured_image?.[0]
                        ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/news-and-updates/${news.featured_image[0]}`
                        : "/img/default-images/yp-news.webp"
                    }
                    alt={news.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
                  {news.title}
                </h4>
                <div className="flex items-center space-x-1 mt-1">
                  <LuCalendar className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500 transition-opacity duration-300">
                    {formatDate(news.publish_date)}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {newsList.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No news available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsAndUpdates;
