import HeadingLine from "@/ui/headings/HeadingLine";
import Link from "next/link";
import React from "react";
import Skeleton from "react-loading-skeleton";

export default function SinglePanelDropdown({
  handleDesktopMouseLeave,
  dropdonwItem,
  isLoading,
}: {
  handleDesktopMouseLeave: () => void;
  dropdonwItem: any;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="container mx-auto p-10 grid grid-cols-4 gap-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton width={150} height={20} />
            <Skeleton count={5} height={15} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-10">
      {Object.entries(dropdonwItem?.dropdownContent || {}).map(
        ([sectionName, section]: [string, any]) => (
          <div key={sectionName}>
            <HeadingLine
              title={section?.main?.title || sectionName}
              className="font-semibold text-(--text-color-emphasis)!"
            />
            <ul className="grid grid-cols-4 gap-x-8">
              {section?.main?.links.map((link: any) => (
                <li key={link.name} className="py-3">
                  <Link
                    href={link?.href || "#"}
                    title={link?.name}
                    onClick={handleDesktopMouseLeave}
                    className="text-sm text-(--text-color) hover:text-(--main)"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            {section?.main?.viewAll && (
              <div className="mt-1 pt-1">
                <Link
                  href={section.main.viewAll}
                  title={`View All ${section.main.title}`}
                  onClick={handleDesktopMouseLeave}
                  className="text-sm text-(--main) hover:underline"
                >
                  VIEW ALL
                </Link>
              </div>
            )}
          </div>
        ),
      )}
    </div>
  );
}
