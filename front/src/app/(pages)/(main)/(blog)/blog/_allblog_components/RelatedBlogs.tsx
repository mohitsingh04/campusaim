"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
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

      const validBlogs: BlogsProps[] = allBlogs
        .filter(
          (item: BlogsProps) =>
            item?.status === "Active" &&
            seoData.some((seo) => seo.blog_id === item._id),
        )
        .map((item: BlogsProps) => {
          const seoMatch = seoData.find((seo) => seo.blog_id === item._id);
          return { ...item, blog_slug: seoMatch?.slug ?? null };
        });

      let otherBlogs = [...validBlogs];

      if (blog?._id) {
        otherBlogs = validBlogs.filter((b) => b._id !== blog._id);
      }

      let finalBlogs: BlogsProps[] = [];

      if (blog?.tags?.length) {
        const relatedBlogs = otherBlogs.filter((item: BlogsProps) => {
          const currentBlogTagNames =
            blog.tags?.map((t) => (typeof t === "object" ? t.blog_tag : t)) ||
            [];

          return item.tags?.some((tag) => {
            const tagName = typeof tag === "object" ? tag?.blog_tag : tag;
            return currentBlogTagNames.includes(tagName);
          });
        });

        const shuffledRelated = [...relatedBlogs].sort(
          () => Math.random() - 0.5,
        );

        if (shuffledRelated.length >= 5) {
          finalBlogs = shuffledRelated.slice(0, 5);
        } else {
          const remaining = 5 - shuffledRelated.length;
          const unrelated = otherBlogs.filter(
            (item) => !shuffledRelated.some((rel) => rel._id === item._id),
          );

          const shuffledUnrelated = unrelated.sort(() => Math.random() - 0.5);

          finalBlogs = [
            ...shuffledRelated,
            ...shuffledUnrelated.slice(0, remaining),
          ];
        }
      } else {
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

  if (blogs?.length <= 0) return;

  return (
    <div className="space-y-4">
      <div className="bg-(--primary-bg) text-(--text-color) rounded-custom shadow-custom p-5">
        <HeadingLine title="Related Blogs" />

        <div className="space-y-4">
          {blogs.map((b, index) => (
            <Link
              key={index}
              href={`/blog/${b.blog_slug}`}
              className="flex space-x-3 group bg-(--secondary-bg) shadow-custom p-2 rounded-custom transition-colors"
            >
              <div className="w-20 aspect-2/1 rounded-custom overflow-hidden shrink-0 relative">
                <Image
                  src={
                    b?.featured_image?.[0]
                      ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/blogs/${b.featured_image[0]}`
                      : "/img/default-images/campusaim-courses-featured.png"
                  }
                  alt={b.title}
                  sizes="80px"
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="paragraph font-medium text-(--text-color-emphasis) group-hover:text-(--main) truncate transition-colors">
                  {b.title}
                </h4>

                <p className="text-sm text-gradient font-medium pt-1">
                  {formatDate(b.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedBlogs;
