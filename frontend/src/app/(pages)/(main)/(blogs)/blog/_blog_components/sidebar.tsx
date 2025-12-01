import API from "@/contexts/API";
import { generateSlug } from "@/contexts/Callbacks";
import { BlogsProps } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { LuCalendar, LuTrendingUp } from "react-icons/lu";

const Sidebar = ({ blog }: { blog: BlogsProps | null }) => {
  const [blogs, setBlogs] = useState<BlogsProps[]>([]);

  const getBlogs = useCallback(async () => {
    try {
      const response = await API.get(`/blog`);
      const data: BlogsProps[] = response.data.filter(
        (item: BlogsProps) => item?.status === "Active"
      );

      const otherBlogs = data.filter(
        (item) => item.uniqueId !== blog?.uniqueId
      );

      const relatedBlogs = otherBlogs.filter((item) =>
        item.tags.some((tag) => blog?.tags.includes(tag))
      );

      const shuffledRelated = relatedBlogs.sort(() => 0.5 - Math.random());

      let finalBlogs: BlogsProps[] = [];

      if (shuffledRelated.length >= 5) {
        finalBlogs = shuffledRelated.slice(0, 5);
      } else {
        const remainingCount = 5 - shuffledRelated.length;

        const unrelatedBlogs = otherBlogs.filter(
          (item) =>
            !shuffledRelated.some((rel) => rel.uniqueId === item.uniqueId)
        );

        const shuffledUnrelated = unrelatedBlogs.sort(
          () => 0.5 - Math.random()
        );
        const filler = shuffledUnrelated.slice(0, remainingCount);

        finalBlogs = [...shuffledRelated, ...filler];
      }

      setBlogs(finalBlogs);
    } catch (error) {
      console.log(error);
    }
  }, [blog]);

  useEffect(() => {
    getBlogs();
  }, [getBlogs]);

  return (
    <div className="space-y-8 sticky top-24">
      <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <LuTrendingUp className="h-5 w-5 text-purple-600" />
          <span>Recent Blogs</span>
        </h3>
        <div className="space-y-4">
          {blogs.map((blog, index) => (
            <Link
              key={index}
              href={`/blog/${generateSlug(blog.title)}`}
              className="flex space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-300 ease-in-out">
                  <Image
                    src={
                      blog?.featured_image?.[0]
                        ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/blogs/${blog.featured_image[0]}`
                        : "/img/default-images/yp-blogs.webp"
                    }
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
                  {blog.title}
                </h4>
                <div className="flex items-center space-x-1 mt-1">
                  <LuCalendar className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500 transition-opacity duration-300">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
