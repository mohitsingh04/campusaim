"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { LuSearch } from "react-icons/lu";
import BlogCard from "./_allblog_components/BlogCard";
import Pagination from "../../../../../ui/pagination/Pagination";
import { getErrorResponse } from "@/context/Callbacks";
import API from "@/context/API";
import { BlogCategoryProps, BlogsProps } from "@/types/BlogTypes";
import BlogListSkeleton from "@/ui/loader/page/blog/BlogListSkeleton";

const BlogPage: React.FC = () => {
  const searchParams = useSearchParams();

  const blogsPerPage = 9;

  const currentPage = useMemo(
    () => Number(searchParams.get("page") || 1),
    [searchParams]
  );
  const [blogs, setBlogs] = useState<BlogsProps[]>([]);
  const [category, setCategory] = useState<BlogCategoryProps[]>([]);
  const [loading, setLoading] = useState(true);

  const getCategory = useCallback(async () => {
    try {
      const response = await API.get(`/blog/category/all`);
      setCategory(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getCategory();
  }, [getCategory]);

  const getBlogs = useCallback(async () => {
    if (!category.length) return;

    setLoading(true);

    try {
      const [allBlogRes, allBlogSeoRes] = await Promise.allSettled([
        API.get(`/blog`),
        API.get("/all/seo?type=blog"),
      ]);

      if (
        allBlogRes.status === "fulfilled" &&
        allBlogSeoRes.status === "fulfilled"
      ) {
        const allBlogsData = allBlogRes?.value?.data || [];
        const seoData = allBlogSeoRes.value.data || [];

        const validBlogs = allBlogsData.filter(
          (blog: BlogsProps) =>
            blog?.status === "Active" &&
            seoData.some((seo: any) => seo.blog_id === blog._id)
        );

        const enrichedBlogs = validBlogs.map((blog: BlogsProps) => {
          const blogCategories = blog.category.map((catId) => {
            const cat = category.find((c) => c.uniqueId === Number(catId));
            return cat?.blog_category || "Unknown Category";
          });

          const seoMatch = seoData.find((seo: any) => seo.blog_id === blog._id);

          return {
            title: blog.title,
            blog: blog.blog,
            category: blogCategories,
            createdAt: blog.createdAt,
            featured_image: blog?.featured_image,
            blog_slug: seoMatch.slug,
          };
        });

        setBlogs(enrichedBlogs);
      }
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    getBlogs();
  }, [getBlogs]);

  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  const startIndex = (currentPage - 1) * blogsPerPage;
  const currentBlogs = blogs.slice(startIndex, startIndex + blogsPerPage);

  if (loading) return <BlogListSkeleton />;
  return (
    <div>
      <div className="bg-(--secondary-bg) px-2 sm:px-8 py-6">
        <div className="space-y-6">
          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentBlogs.map((blog, idx) => (
              <BlogCard blog={blog} key={idx} />
            ))}
          </div>

          {/* Empty State */}
          {blogs.length <= 0 && (
            <div className="text-center py-16 bg-(--primary-bg) text-(--text-color) rounded-custom shadow-custom">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-(--main-light) text-(--main-emphasis) rounded-full flex items-center justify-center mx-auto mb-4">
                  <LuSearch className="h-12 w-12" />
                </div>
                <h3 className="heading text-(--text-color-emphasis) font-semibold">
                  No blogs found
                </h3>
                <p className="mb-4">Try adjusting your search terms.</p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {blogs.length > blogsPerPage && (
            <div>
              <Pagination totalPages={totalPages} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
