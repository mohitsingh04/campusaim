"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LuSearch } from "react-icons/lu";
import BlogCard from "./_allblog_components/BlogCard";
import Pagination from "./_allblog_components/Pagination";
import API from "@/contexts/API";
import { stripHtmlAndLimit } from "@/contexts/Callbacks";
import { BlogsProps, BlogCategoryProps, UserProps } from "@/types/types";
import FeaturedBlog from "./_allblog_components/FeaturedBlog";
import Breadcrumb from "@/components/breadcrumbs/breadcrumbs";
import BlogLoader from "@/components/Loader/Blog/BlogLoader";

const BlogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBlogs, setFilteredBlogs] = useState<BlogsProps[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;
  const [blogs, setBlogs] = useState<BlogsProps[]>([]);
  const [users, setUsers] = useState<UserProps[]>([]);
  const [category, setCategory] = useState<BlogCategoryProps[]>([]);
  const [loading, setLoading] = useState(true);

  const getCategory = useCallback(async () => {
    try {
      const response = await API.get(`/blog/category/all`);
      setCategory(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getUsers = useCallback(async () => {
    try {
      const response = await API.get(`/profile/users`);
      setUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    getCategory();
  }, [getCategory]);

  const getBlogs = useCallback(async () => {
    if (users?.length <= 0 && category?.length <= 0) return;
    setLoading(false);
    try {
      const response = await API.get(`/blog`);
      const data = response.data.filter(
        (item: BlogsProps) => item.status === "Active"
      );

      const enrichedBlogs = data.map((blog: BlogsProps) => {
        const author = users.find(
          (user) => Number(user.uniqueId) === Number(blog.author)
        );

        const blogCategories = blog.category.map((catId) => {
          const cat = category.find((c) => c.uniqueId === Number(catId));
          return cat?.blog_category || "Unknown Category";
        });

        return {
          title: blog.title,
          blog: blog.blog,
          category: blogCategories,
          author_name: author?.name || "Unknown Author",
          author_profile: author?.avatar || "",
          createdAt: blog.createdAt,
          featured_image: blog?.featured_image,
        };
      });

      setBlogs(enrichedBlogs);
      setFilteredBlogs(
        enrichedBlogs.filter((_: BlogsProps[], index: number) => index !== 0)
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [users, category]);

  useEffect(() => {
    getBlogs();
  }, [users, category, getBlogs]);

  const featuredBlog = blogs[0];
  const regularBlogs = useMemo(
    () => blogs.filter((_, index) => index !== 0),
    [blogs]
  );

  useEffect(() => {
    let filtered = regularBlogs;

    if (searchTerm) {
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stripHtmlAndLimit(blog?.blog)
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBlogs(filtered);
    setCurrentPage(1);
  }, [searchTerm, regularBlogs]);

  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const currentBlogs = filteredBlogs.slice(
    startIndex,
    startIndex + blogsPerPage
  );

  return (
    <div>
      {!loading ? (
        <div className="bg-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div>
              <Breadcrumb items={[{ label: "Blog" }]} />
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center space-y-3">
            <h1 className="text-4xl font-bold">All Blog</h1>
            <p>
              Read our latest yoga blog for tips, poses, wellness guides, and
              inspiration to deepen your yoga journey every day.
            </p>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            {featuredBlog && currentPage === 1 && (
              <FeaturedBlog blog={featuredBlog} />
            )}
            <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md w-full">
                  <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search blogs, tags, or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  />
                </div>
                <div>
                  <p className="text-gray-600 flex items-center space-x-2">
                    <span>
                      {filteredBlogs.length === regularBlogs.length ? (
                        <>
                          Showing all{" "}
                          <span className="font-bold text-purple-600">
                            {filteredBlogs.length}
                          </span>{" "}
                          blogs
                        </>
                      ) : (
                        `Found ${filteredBlogs.length} blog${
                          filteredBlogs.length !== 1 ? "s" : ""
                        }`
                      )}
                    </span>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="text-purple-600 bg-purple-50 px-3 py-2 rounded-xl hover:text-purple-700 text-sm font-medium flex items-center cursor-pointer hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`}
            >
              {currentBlogs.map((blog, index) => (
                <BlogCard key={index} blog={blog} index={index} />
              ))}
            </div>

            {filteredBlogs.length === 0 && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LuSearch className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No blogs found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search terms to discover great content.
                  </p>
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      ) : (
        <BlogLoader />
      )}
    </div>
  );
};

export default BlogPage;
