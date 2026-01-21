"use client";

import React, { useCallback, useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { BlogCategoryProps, BlogsProps, BlogTagProps } from "@/types/BlogTypes";
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
import RelatedBlogs from "../_allblog_components/RelatedBlogs";
import BlogCourse from "../_allblog_components/BlogCourses";
import BlogEnquiryForm from "../_allblog_components/BlogEnquiryForm";
import HeadingLine from "@/ui/headings/HeadingLine";
import BlogDetailSkeleton from "@/ui/loader/page/blog/BlogDetailSkeleton";
import Badge from "@/ui/badge/Badge";

const BlogDetailPage: React.FC = () => {
  const { blog_slug } = useParams();
  const [blog, setBlog] = useState<BlogsProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProps | null>(null);
  const [categories, setCategories] = useState<BlogCategoryProps[]>([]);
  const [tags, setTags] = useState<BlogTagProps[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          API.get(`/blog/category/all`),
          API.get(`/blog/tag/all`),
        ]);
        setCategories(categoriesRes.data);
        setTags(tagsRes.data);
      } catch (error) {
        getErrorResponse(error, true);
      }
    };
    fetchData();
  }, []);

  const getCategoryById = useCallback(
    (id: string) => {
      const cat = categories.find((c) => c.uniqueId === Number(id));
      return cat?.blog_category || "Unknown Category";
    },
    [categories]
  );

  const getTagById = useCallback(
    (id: string) => {
      const tag = tags.find((c) => c.uniqueId === Number(id));
      return tag?.blog_tag || "Unknown Tag";
    },
    [tags]
  );

  const getBlog = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/blog/seo/${blog_slug}`);
      const data = response.data;

      if (!data) return setBlog(null);

      const finalBlog: BlogsProps = {
        uniqueId: data?.uniqueId,
        title: data.title,
        blog: data.blog,
        featured_image: data.featured_image,
        author: data.author,
        category: data.category.map((id: string) => getCategoryById(id)),
        tags: data.tags.map((id: string) => getTagById(id)),
        createdAt: data.createdAt,
        blog_slug: data.slug,
      };

      setBlog(finalBlog);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [blog_slug, getCategoryById, getTagById]);

  useEffect(() => {
    getBlog();
  }, [getBlog]);

  const getUser = useCallback(async () => {
    if (!blog?.author) return;
    try {
      const response = await API.get(`/profile/user/uniqueId/${blog?.author}`);
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
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/blogs/${blog.featured_image[0]}`
    : "/img/default-images/yp-blogs.webp";

  if (loading) return <BlogDetailSkeleton />;

  return (
    <div className="bg-(--secondary-bg) py-6">
      <div className="mx-auto px-2 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <article className="bg-(--primary-bg) text-(--text-color) rounded-custom shadow-custom overflow-hidden">
              <div className="relative w-full aspect-video">
                <Image
                  src={featuredImageUrl}
                  alt={blog?.title || ""}
                  fill
                  priority
                  className="aspect-2/1 object-cover"
                />
              </div>

              <div className="p-5">
                {/* Meta */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
                  {blog?.category?.map((category) => (
                    <Badge label={category} key={category} color="main" />
                  ))}

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
                  <ReadMoreLess html={blog?.blog} />
                </div>

                {/* Tags */}
                <div className="mt-5 pt-5 border-t border-(--border)">
                  <HeadingLine title="Tags" />
                  <div className="flex flex-wrap gap-3">
                    {blog?.tags?.map((tag) => (
                      <Badge label={tag} key={tag} color="main" />
                    ))}
                  </div>
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
            <BlogEnquiryForm blog={blog} />
          </div>

          <aside className="lg:col-span-1 space-y-6">
            <BlogCourse />
            <RelatedBlogs blog={blog} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
