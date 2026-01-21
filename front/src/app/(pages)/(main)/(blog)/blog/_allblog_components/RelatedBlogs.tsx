"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { LuCalendar } from "react-icons/lu";
import { BlogsProps } from "@/types/BlogTypes";
import API from "@/context/API";
import { formatDate, getErrorResponse } from "@/context/Callbacks";
import HeadingLine from "@/ui/headings/HeadingLine";

const RelatedBlogs = ({ blog }: { blog?: BlogsProps | null }) => {
  const [blogs, setBlogs] = useState<BlogsProps[]>([]);

  const getBlogs = useCallback(async () => {
    try {
      const [allBlogRes, allBlogSeoRes] = await Promise.allSettled([
        API.get(`/blog`),
        API.get("/all/seo?type=blog"),
      ]);

      if (
        allBlogRes.status !== "fulfilled" ||
        allBlogSeoRes.status !== "fulfilled"
      ) {
        return;
      }

      const allBlogs: BlogsProps[] = allBlogRes.value.data || [];
      const seoData: any[] = allBlogSeoRes.value.data || [];

      // Valid = active + has SEO slug
      const validBlogs: BlogsProps[] = allBlogs
        .filter(
          (item: BlogsProps) =>
            item?.status === "Active" &&
            seoData.some((seo) => seo.blog_id === item._id)
        )
        .map((item: BlogsProps) => {
          const seoMatch = seoData.find((seo) => seo.blog_id === item._id);
          return { ...item, blog_slug: seoMatch?.slug ?? null };
        });

      let otherBlogs = [...validBlogs];

      // Remove current blog if available
      if (blog?.uniqueId) {
        otherBlogs = validBlogs.filter((b) => b.uniqueId !== blog.uniqueId);
      }

      let finalBlogs: BlogsProps[] = [];

      // If blog exists → use related logic
      if (blog?.tags?.length) {
        const relatedBlogs = otherBlogs.filter((item: BlogsProps) =>
          item.tags?.some((tag: string) => blog.tags.includes(tag))
        );

        const shuffledRelated = [...relatedBlogs].sort(
          () => Math.random() - 0.5
        );

        if (shuffledRelated.length >= 5) {
          finalBlogs = shuffledRelated.slice(0, 5);
        } else {
          const remaining = 5 - shuffledRelated.length;
          const unrelated = otherBlogs.filter(
            (item) =>
              !shuffledRelated.some((rel) => rel.uniqueId === item.uniqueId)
          );

          const shuffledUnrelated = unrelated.sort(() => Math.random() - 0.5);

          finalBlogs = [
            ...shuffledRelated,
            ...shuffledUnrelated.slice(0, remaining),
          ];
        }
      } else {
        // No blog passed -> show 5 random blogs
        finalBlogs = otherBlogs.sort(() => Math.random() - 0.5).slice(0, 5);
      }

      setBlogs(finalBlogs);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [blog]);

  useEffect(() => {
    getBlogs();
  }, [getBlogs]);

  return (
    <div className="space-y-4 sticky top-15">
      <div className="bg-(--primary-bg) text-(--text-color) rounded-custom shadow-custom p-5">
        <HeadingLine title="Related Blogs" />

        <div className="space-y-4">
          {blogs.map((b) => (
            <Link
              key={b.uniqueId}
              href={`/blog/${b.blog_slug}`}
              className="flex space-x-3 group bg-(--secondary-bg) shadow-custom p-2 rounded-custom transition-colors"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
                <Image
                  src={
                    b?.featured_image?.[0]
                      ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/blogs/${b.featured_image[0]}`
                      : "/img/default-images/yp-blogs.webp"
                  }
                  alt={b.title}
                  fill
                  sizes="64px"
                  className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="paragraph font-medium text-(--text-color-emphasis) group-hover:text-(--main) truncate transition-colors">
                  {b.title}
                </h4>

                <div className="flex items-center space-x-1 pt-1">
                  <LuCalendar className="h-3 w-3 text-(--main)" />
                  <span className="paragraph">{formatDate(b.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedBlogs;
