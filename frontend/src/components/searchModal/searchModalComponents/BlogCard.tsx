import { generateSlug } from "@/contexts/Callbacks";
import { BlogsProps } from "@/types/types";
import Link from "next/link";
import React from "react";
import { LuGrid3X3, LuPenLine, LuText } from "react-icons/lu";

export default function BlogCard({
  blog,
  handleStoreSearch,
  onClose,
}: {
  blog: BlogsProps;
  onClose: () => void;
  handleStoreSearch: () => void;
}) {
  return (
    <section>
      <div className="bg-purple-100 p-6 rounded-2xl shadow-xs flex justify-between items-start mt-2">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
            <LuText className="w-6 h-6 text-purple-700" />
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href={`/blog/${generateSlug(blog?.title)}`}
              onClick={() => {
                handleStoreSearch();
                onClose();
              }}
              className="text-lg font-semibold text-purple-600 hover:text-purple-800"
            >
              {blog?.title}
            </Link>

            <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
              <LuGrid3X3 className="w-4 h-4 text-purple-500" />
              <span>{blog?.category?.[0]}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <LuPenLine className="w-5 h-5 text-purple-600" />
          <h3 className="text-xl font-bold text-purple-800">Blog</h3>
        </div>
      </div>
    </section>
  );
}
