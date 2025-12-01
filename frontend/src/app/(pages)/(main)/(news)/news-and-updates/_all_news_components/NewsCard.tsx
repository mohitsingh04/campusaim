import React from "react";
import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { NewsProps } from "@/types/types";
import { generateSlug, stripHtmlAndLimit } from "@/contexts/Callbacks";
import Image from "next/image";

interface NewsCardProps {
  update: NewsProps;
  index: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ update, index }) => {
  return (
    <article
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden transform hover:-translate-y-3 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative overflow-hidden">
        <Link
          href={`/news-and-updates/${generateSlug(update?.title)}`}
          className="group relative block"
        >
          <div className="relative w-full aspect-[2/1] overflow-hidden">
            <Image
              src={
                update?.featured_image?.[0]
                  ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/updates/${update?.featured_image[0]}`
                  : "/img/default-images/yp-news.webp"
              }
              alt={update?.title}
              fill
              className="transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </Link>
      </div>

      <div className="p-6">
        <Link href={`/news-and-updates/${generateSlug(update?.title)}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-purple-600 transition-colors duration-200 line-clamp-2 leading-tight">
            {update?.title}
          </h3>
        </Link>

        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {stripHtmlAndLimit(update?.content, 80)}
        </p>

        <div className="flex items-center justify-between">
          <Link
            href={`/news-and-updates/${generateSlug(update?.title)}`}
            className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 font-medium text-sm transition-all duration-200 transform hover:translate-x-1"
          >
            <span>Read</span>
            <LuArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
