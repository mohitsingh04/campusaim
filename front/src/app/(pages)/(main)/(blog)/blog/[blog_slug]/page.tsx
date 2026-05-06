import React from "react";
import {
  extractKeywords,
  getErrorResponse,
  stripHtml,
} from "@/context/Callbacks";
import RelatedBlogs from "../_allblog_components/RelatedBlogs";
import BlogCourse from "../_allblog_components/BlogCourses";
import BlogDetailSkeleton from "@/ui/loader/page/blog/BlogDetailSkeleton";
import { getUserById } from "@/lib/Fetch-User";
import API from "@/context/API";
import { Metadata } from "next";
import BlogPage from "./BlogPage";
import FaqJsonSchema from "@/components/json_schemas/FaqJsonSchema";
import RelatedNews from "../../../(news-and-updates)/news-and-updates/_news_components/RelatedNews";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;
const DEFAULT_IMAGE = `${BASE_URL}/img/default-images/campusaim-courses-featured.png`;

async function getBlogData(blog_slug: string) {
  try {
    const res = await API.get(`/blog/seo/${blog_slug}`, {
      headers: { origin: BASE_URL },
    });
    return res.data;
  } catch (error) {
    getErrorResponse(error, true);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    blog_slug: string;
  }>;
}): Promise<Metadata> {
  const { blog_slug } = await params;
  const blog = await getBlogData(blog_slug);

  if (!blog) {
    return { title: "Educational Blog" };
  }

  const title = blog?.title;
  const description =
    stripHtml(blog?.seo?.meta_description, 160) ||
    stripHtml(blog?.blog, 160) ||
    "Explore the Campusaim blog. Get expert education insights, career guidance, admission tips & student-focused learning resources.";
  const keywords =
    blog?.seo?.primary_focus_keyword?.length > 0
      ? extractKeywords(blog?.seo?.primary_focus_keyword)
      : [blog?.title, "Education blog", "campusaim blog"];
  const canonical = `${BASE_URL}/blog/${blog?.seo?.slug}`;

  const ogImage = blog.featured_image?.[0]
    ? `${MEDIA_URL}/blogs/${blog.featured_image[0]}`
    : DEFAULT_IMAGE;

  const featuredImage = [
    {
      url: ogImage,
      width: 1200,
      height: 700,
      alt: title || "Blog Featured Image",
    },
  ];

  return {
    title: title,
    description: description,
    keywords: keywords,
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: title,
      description: description,
      url: canonical,
      siteName: "Campusaim",
      images: featuredImage,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: featuredImage,
    },
  };
}

const BlogDetailPage = async ({
  params,
}: {
  params: Promise<{
    blog_slug: string;
  }>;
}) => {
  let loading = true;
  const { blog_slug } = await params;
  const blog = await getBlogData(blog_slug);
  const user = await getUserById(blog?.author);

  loading = false;
  if (loading) return <BlogDetailSkeleton />;

  return (
    <div className="bg-(--secondary-bg) py-6">
      <FaqJsonSchema faqs={blog?.faqs || []} slug={blog_slug} />
      <div className="mx-auto px-2 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BlogPage blog={blog} user={user} />
          <aside className="lg:col-span-1 space-y-6">
            <RelatedBlogs blog={blog} />
            <BlogCourse />
            <RelatedNews />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
