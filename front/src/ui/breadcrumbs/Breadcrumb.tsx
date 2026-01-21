import React from "react";
import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";
import { BreadcrumbProps } from "@/types/UiTypes";

interface BreadcrumbComponentProps {
  items: BreadcrumbProps[];
}

const Breadcrumb: React.FC<BreadcrumbComponentProps> = ({ items }) => {
  const lastIndex = items.length - 1;

  return (
    <nav className="flex text-sm rounded-custom" aria-label="Breadcrumb">
      <ol className="inline-flex items-center">
        {/* Home */}
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center font-medium text-(--text-color-emphasis) hover:text-(--main)"
          >
            Home
          </Link>
        </li>

        {items.map((item, index) => {
          const isActive = index === lastIndex;

          return (
            <li key={index}>
              <div className="flex items-center">
                <LuChevronRight className="w-4 h-4 text-(--text-color-emphasis)" />

                {isActive ? (
                  <span className="font-medium text-(--text-color)">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href ?? "#"}
                    className="font-medium text-(--text-color-emphasis) hover:text-(--main)"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
