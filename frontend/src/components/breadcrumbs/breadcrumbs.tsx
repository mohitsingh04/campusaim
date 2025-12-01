import { BreadcrumbItemProps } from "@/types/types";
import Link from "next/link";
import React from "react";
import { LuChevronRight, LuHouse } from "react-icons/lu";

const Breadcrumb = ({ items }: { items: BreadcrumbItemProps[] }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 bg-white rounded-lg px-4 py-3 shadow-sm">
      <Link
        href="/"
        className="flex items-center space-x-1 hover:text-purple-600 transition-colors duration-200 group"
      >
        <LuHouse className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <LuChevronRight className="h-4 w-4 text-gray-400" />
          {item.path ? (
            <Link
              href={item.path}
              className="hover:text-purple-600 transition-colors duration-200 hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className="text-gray-900 font-medium max-w-xs truncate"
              title={item.label}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
