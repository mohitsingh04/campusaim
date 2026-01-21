"use client";

import Image from "next/image";
import Link from "next/link";
import ReadMoreButton from "@/ui/buttons/ReadMoreButton";
import { generateSlug, stripHtmlAndLimit } from "@/context/Callbacks";
import { BlogsProps } from "@/types/BlogTypes";

const BlogCard = ({ blog }: { blog: BlogsProps }) => {
  const slug = `/blog/${generateSlug(blog.blog_slug)}`;

  const imageSrc = blog?.featured_image?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/blogs/${blog.featured_image[0]}`
    : "/img/default-images/yp-blogs.webp";

  return (
    <div className="bg-(--primary-bg) text-(--text-color) rounded-custom shadow-custom hover:shadow-md overflow-hidden group transition-all duration-300 flex flex-col">
      {/* Image */}
      <Link href={slug}>
        <div className="relative w-full aspect-2/1 overflow-hidden">
          <Image
            src={imageSrc}
            alt={blog.title || "Blog Image"}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <Link href={slug}>
          <h3 className="sub-heading font-semibold mb-2 text-(--text-color-emphasis) hover:text-(--main) transition-colors">
            {blog.title}
          </h3>
        </Link>

        <p className="text-(--text-color) mb-4 line-clamp-3">
          {stripHtmlAndLimit(blog.blog, 125)}
        </p>

        {/* Button always at bottom */}
        <div className="mt-auto">
          <ReadMoreButton href={slug} />
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
