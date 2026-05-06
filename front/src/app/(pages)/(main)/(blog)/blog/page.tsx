import React from "react";
import BlogCard from "./_allblog_components/BlogCard";
import Pagination from "../../../../../ui/pagination/Pagination";
import API from "@/context/API";
import { BlogsProps } from "@/types/BlogTypes";
import { Metadata } from "next";
import { SearchIcon } from "lucide-react";

const blogsPerPage = 9;
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://campusaim.com";

const title = "Blog";
const keywords = ["education blog", "career guidance blog", "campus aim blog"];
const description =
  "Explore education news, career guidance, admission updates, college insights & student tips on the Campusaim Blog for smarter career decisions.";
const featuredImage = [
  {
    url: "/img/main-images/campusaim.png",
    width: 1200,
    height: 700,
    alt: "Blog Featured",
  },
];
export const metadata: Metadata = {
  title: title,
  description: description,
  keywords: keywords,
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: title,
    description: description,
    url: "/blog",
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

async function getEnrichedBlogs() {
  try {
    const [allBlogRes, allBlogSeoRes] = await Promise.allSettled([
      API.get(`/blog`, { headers: { origin: BASE_URL } }),
      API.get("/all/seo?type=blog", { headers: { origin: BASE_URL } }),
    ]);

    if (
      allBlogRes.status === "fulfilled" &&
      allBlogSeoRes.status === "fulfilled"
    ) {
      const allBlogsData = allBlogRes.value.data || [];
      const seoData = allBlogSeoRes.value.data || [];

      return allBlogsData
        .filter(
          (blog: BlogsProps) =>
            blog?.status === "Active" &&
            seoData.some((seo: any) => seo.blog_id === blog._id),
        )
        .map((blog: BlogsProps) => {
          const seoMatch = seoData.find((seo: any) => seo.blog_id === blog._id);
          return {
            title: blog.title,
            blog: blog.blog,
            createdAt: blog.createdAt,
            featured_image: blog?.featured_image,
            blog_slug: seoMatch.slug,
          };
        });
    }
    return [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

const BlogPage = async ({ searchParams }: PageProps) => {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page || 1);

  const blogs = await getEnrichedBlogs();

  const totalPages = Math.ceil(blogs.length / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const currentBlogs = blogs.slice(startIndex, startIndex + blogsPerPage);

  return (
    <div className="bg-(--secondary-bg) px-2 sm:px-8 py-6">
      <div className="space-y-6">
        {currentBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentBlogs.map((blog: BlogsProps, idx: number) => (
              <BlogCard blog={blog} key={idx} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-(--primary-bg) text-(--text-color) rounded-custom shadow-custom">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-(--main-subtle) text-(--main-emphasis) rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="h-12 w-12" />
              </div>
              <h3 className="heading text-(--text-color-emphasis) font-semibold">
                No blogs found
              </h3>
              <p className="mb-4">Try adjusting your search terms.</p>
            </div>
          </div>
        )}

        {blogs.length > blogsPerPage && (
          <div>
            <Pagination totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
