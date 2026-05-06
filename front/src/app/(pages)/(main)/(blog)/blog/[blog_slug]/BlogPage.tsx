import React from "react";
import BlogEnquiryForm from "../_allblog_components/BlogEnquiryForm";
import Image from "next/image";
import { formatDate, getUserAvatar } from "@/context/Callbacks";
import { Badge } from "@/ui/badge/Badge";
import HeadingLine from "@/ui/headings/HeadingLine";
import FaqComponents from "@/ui/accordions/FaqComponents";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { BlogsProps } from "@/types/BlogTypes";
import { UserProps } from "@/types/UserTypes";

export default function BlogPage({
  blog,
  user,
}: {
  blog: BlogsProps;
  user: UserProps;
}) {
  const safeCreatedAt = blog?.createdAt ? new Date(blog.createdAt) : null;

  const featuredImageUrl = blog?.featured_image?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/blogs/${blog.featured_image[0]}`
    : "/img/default-images/campusaim-courses-featured.png";
  return (
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
            {blog?.category?.map((category, index) => (
              <Badge
                label={
                  typeof category === "object"
                    ? category.blog_category
                    : category
                }
                key={index}
                color="main"
              />
            ))}

            <div className="flex items-center space-x-1 ml-auto">
              <CalendarIcon className="h-4 w-4 text-(--main)" />
              <p className="text-sm">{formatDate(blog?.createdAt || "")}</p>
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
            {blog?.title}
          </h1>

          <div>
            <ReadMoreLess html={blog?.blog || ""} maxHeight={500} />
          </div>
          {blog?.faqs && blog.faqs.length > 0 && (
            <div className="mt-8 pt-5 border-t border-(--border)">
              <HeadingLine title="Frequently Asked Questions" />
              <div className="space-y-3 mt-4">
                <FaqComponents faqs={blog?.faqs || []} />
              </div>
            </div>
          )}

          {(blog?.tags?.length || 0) > 0 && (
            <div className="mt-5 pt-5 border-t border-(--border)">
              <HeadingLine title="Tags" />
              <div className="flex flex-wrap gap-3">
                {blog?.tags?.map((tag, index) => (
                  <Badge
                    label={typeof tag === "object" ? tag.blog_tag : tag}
                    key={index}
                    color="main"
                  />
                ))}
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
      <BlogEnquiryForm blog={blog} />
    </div>
  );
}
