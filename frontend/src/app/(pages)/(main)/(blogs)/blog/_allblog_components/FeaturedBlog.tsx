import React from "react";
import { LuArrowRight, LuCalendar, LuClock } from "react-icons/lu";
import Link from "next/link";
import { stripHtmlAndLimit, generateSlug } from "@/contexts/Callbacks";
import { formatDistanceToNow } from "date-fns";
import { BlogsProps } from "@/types/types";
import Image from "next/image";

const FeaturedBlog = ({ blog }: { blog: BlogsProps }) => {
  return (
    <div className="relative bg-purple-600 rounded-3xl overflow-hidden shadow-2xl mb-16">
      <div className="absolute inset-0 bg-black/30"></div>

      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url(${
            blog?.featured_image?.[0]
              ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/blogs/${blog.featured_image[0]}`
              : "/img/default-images/yp-blogs.webp"
          })`,
        }}
      ></div>

      <div className="relative p-8 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-2">
              <span className="text-white text-sm font-medium">
                {blog.category[0]}
              </span>
            </div>

            <Link href={`/blog/${generateSlug(blog.title)}`}>
              <h2 className="text-3xl lg:text-4xl font-bold text-white hover:text-purple-100 mb-1 leading-tight">
                {blog.title}
              </h2>
            </Link>

            <p className="text-purple-100 text-lg mb-2 leading-relaxed">
              {stripHtmlAndLimit(blog.blog, 240)}
            </p>

            <div className="flex items-center space-x-6 text-purple-200 mb-4">
              <div className="flex items-center space-x-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={
                      blog?.author_profile?.[0]
                        ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${blog.author_profile[0]}`
                        : "/img/default-images/yp-user.webp"
                    }
                    alt={blog.author_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium">{blog.author_name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <LuCalendar className="h-4 w-4" />
                <span className="text-sm">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <LuClock className="h-4 w-4" />
                <span className="text-sm">
                  {formatDistanceToNow(new Date(blog?.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            <Link
              href={`/blog/${generateSlug(blog.title)}`}
              className="inline-flex items-center space-x-2 bg-white text-purple-700 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span>Read Full Article</span>
              <LuArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="hidden lg:block">
            <Link href={`/blog/${generateSlug(blog.title)}`} className="block">
              <div className="relative w-full aspect-[2/1] rounded-2xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <Image
                  src={
                    blog?.featured_image?.[0]
                      ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/blogs/${blog.featured_image[0]}`
                      : "/img/default-images/yp-blogs.webp"
                  }
                  alt={blog.title}
                  fill
                  className="object-cover rounded-2xl"
                />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedBlog;
