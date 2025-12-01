"use client";
import React, { useCallback, useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { LuArrowLeft, LuCalendar, LuClock, LuTag } from "react-icons/lu";
import Breadcrumb from "@/components/breadcrumbs/breadcrumbs";
import API from "@/contexts/API";
import {
  BlogCategoryProps,
  BlogsProps,
  BlogTagProps,
  UserProps,
} from "@/types/types";
import { generateSlug } from "@/contexts/Callbacks";
import { formatDistanceToNow } from "date-fns";
import Sidebar from "../_blog_components/sidebar";
import BlogEnquiryForm from "../_blog_components/BlogEnquiryForm";
import BlogDetailLoader from "@/components/Loader/Blog/BlogDetailLoader";
import Image from "next/image";

const BlogDetailPage: React.FC = () => {
  const { blog_slug } = useParams();
  const [blog, setBlog] = useState<BlogsProps | null>(null);
  const [users, setUsers] = useState<UserProps[]>([]);
  const [categories, setCategories] = useState<BlogCategoryProps[]>([]);
  const [tags, setTags] = useState<BlogTagProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, categoriesRes, tagsRes] = await Promise.all([
          API.get(`/profile/users`),
          API.get(`/blog/category/all`),
          API.get(`/blog/tag/all`),
        ]);
        setUsers(usersRes.data);
        setCategories(categoriesRes.data);
        setTags(tagsRes.data);
      } catch (error) {
        console.error(error);
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
      const cat = tags.find((c) => c.uniqueId === Number(id));
      return cat?.blog_tag || "Unknown Category";
    },
    [tags]
  );

  const getAuthor = useCallback(
    (id: string): UserProps | undefined => {
      return users.find((c) => c.uniqueId === Number(id));
    },
    [users]
  );

  const getBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/blog`);
      const data = response.data.filter(
        (item: BlogsProps) => item.status === "Active"
      );
      const mainBlog = data.find(
        (item: BlogsProps) => generateSlug(item.title) === blog_slug
      );
      if (!mainBlog) return;

      const authorData = getAuthor(mainBlog.author.toString());

      const finalBlog: BlogsProps = {
        uniqueId: mainBlog?.uniqueId,
        title: mainBlog.title,
        blog: mainBlog.blog,
        featured_image: mainBlog.featured_image,
        author: mainBlog.author,
        author_name: authorData?.name || "Unknown Author",
        author_profile: authorData?.avatar || [],
        category: mainBlog.category.map((id: string) => getCategoryById(id)),
        tags: mainBlog.tags.map((id: string) => getTagById(id)),
        createdAt: mainBlog.createdAt,
      };

      setBlog(finalBlog);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [blog_slug, getAuthor, getCategoryById, getTagById]);

  useEffect(() => {
    if (!blog && !loading) {
      notFound();
    }
  }, [blog, loading]);

  useEffect(() => {
    if (users.length && categories.length && tags.length) {
      getBlogs();
    }
  }, [users, categories, tags, getBlogs]);

  useEffect(() => {
    if (!blog?.blog) return;

    const accordions = document.querySelectorAll<HTMLDivElement>(
      "#blog-main .accordion"
    );

    const handleClick = (accordion: HTMLElement) => {
      const answer = accordion.querySelector<HTMLElement>(".accordion-answer");
      if (!answer) return;

      const isOpen = accordion.classList.contains("active");

      accordions.forEach((acc) => {
        acc.classList.remove("active");
        const otherAnswer = acc.querySelector<HTMLElement>(".accordion-answer");
        if (otherAnswer) {
          otherAnswer.style.display = "none";
        }
      });

      if (!isOpen) {
        accordion.classList.add("active");
        answer.style.display = "block";
      }
    };

    accordions.forEach((accordion) => {
      const question = accordion.querySelector<HTMLElement>(
        ".accordion-question"
      );
      if (question) {
        question.addEventListener("click", () => handleClick(accordion));
      }
    });

    return () => {
      accordions.forEach((accordion) => {
        const question = accordion.querySelector<HTMLElement>(
          ".accordion-question"
        );
        if (question) {
          const clone = question.cloneNode(true);
          question.replaceWith(clone);
        }
      });
    };
  }, [blog?.blog]);

  return (
    <>
      {!loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-purple-600 transition-colors  group"
            >
              <LuArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform  hover:text-purple-800 duration-200" />
              <span>Back to Blog</span>
            </Link>
          </div>

          <div className="mb-8">
            <Breadcrumb
              items={[
                { label: "Blog", path: "/blog" },
                { label: blog?.title || "Blog" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="relative w-full aspect-[2/1]">
                  <Image
                    src={
                      blog?.featured_image?.[0]
                        ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/blogs/${blog?.featured_image?.[0]}`
                        : "/img/default-images/yp-blogs.webp"
                    }
                    alt={blog?.title || "Blog Featured"}
                    fill
                    priority
                    className="object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                </div>

                <div className="p-8">
                  <div className="flex flex-wrap gap-2">
                    {blog?.category.map((category) => (
                      <span
                        key={category}
                        className="bg-purple-600 text-white px-4 py-2 my-4 rounded-full text-sm font-medium shadow-lg"
                      >
                        {category}
                      </span>
                    ))}
                    <div className="flex items-center text-gray-400 pe-6 space-x-1 hover:text-purple-600 transition-colors duration-200 ml-auto">
                      <LuCalendar className="h-4 w-4" />
                      <span>
                        {new Date(blog?.createdAt || "").toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-gray-400 hover:text-purple-600 transition-colors duration-200">
                      <LuClock className="h-4 w-4" />
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(blog?.createdAt || ""), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {blog?.title || ""}
                  </h1>

                  {/* Content */}
                  <div
                    id="blog-main"
                    className="prose prose-lg max-w-none prose-headings:text-gray-900  prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-ul:my-6 pb-8 prose-li:my-2"
                    dangerouslySetInnerHTML={{ __html: blog?.blog || "" }}
                  />

                  {/* Tags */}
                  <div className="mt-8 pt-2">
                    <div className="flex items-center space-x-2 mb-4">
                      <LuTag className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {blog?.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm hover:bg-purple-200 cursor-pointer transition-all duration-200 transform hover:scale-105"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
              {/* information section  */}
              <div className="bg-gray-50 rounded-2xl p-6 md:flex items-start space-x-6 mt-5 shadow-sm shad">
                {/* Image */}
                <div className="flex flex-col items-center justify-center w-32 h-40 mx-auto md:mx-0">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-100 mb-3">
                    <Image
                      src={
                        blog?.author_profile?.[0]
                          ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${blog.author_profile[0]}`
                          : "/img/default-images/yp-user.webp"
                      }
                      alt={blog?.author_name || ""}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* <button className="px-4 py-2 rounded-full text-sm hover:bg-gray-100 transition">
                Read Full Bio
              </button> */}
                </div>

                {/* Info */}
                <div className="mt-4 md:mt-0 text-center md:text-left flex-1 p-6">
                  <p className="text-sm text-green-600 font-semibold">
                    Meditation for Beginners: A Complete Guide
                  </p>
                  <p className="font-medium text-gray-900 my-2">
                    {blog?.author_name}
                  </p>
                  {/* <p className="text-gray-700 font-medium mt-1">
                Senior News Writer at{" "}
                <span className="text-green-600 font-semibold">
                  Search Engine Journal
                </span>
              </p> */}
                  {/* <p className="text-small text-gray-500">{blog.author.bio}</p> */}
                </div>
              </div>
              <BlogEnquiryForm blog={blog} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Sidebar blog={blog} />
            </div>
          </div>
        </div>
      ) : (
        <BlogDetailLoader />
      )}
    </>
  );
};

export default BlogDetailPage;
