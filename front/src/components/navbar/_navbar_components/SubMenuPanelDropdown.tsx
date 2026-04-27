import HeadingLine from "@/ui/headings/HeadingLine";
import Link from "next/link";
import React from "react";
import Skeleton from "react-loading-skeleton";

const SubMenuSkeleton = () => (
  <div className="flex">
    <div className="w-1/4 bg-(--main-emphasis) text-(--text-color-emphasis)">
      <ul className="py-4">
        {Array(5)
          .fill(true)
          ?.map((_, index) => (
            <li
              key={index}
              className={`px-5 py-3 text-(--white) cursor-pointer text-sm ${
                index === 0
                  ? "relative font-semibold after:border-l-(--main-emphasis) after:content-[''] after:block after:absolute after:top-1/2 after:-translate-y-1/2 after:left-full after:border-y-8 after:border-l-8 after:border-y-transparent"
                  : "font-medium"
              }`}
            >
              <Skeleton
                height={20}
                baseColor="var(--main)"
                highlightColor="var(--main-subtle)"
              />
            </li>
          ))}
      </ul>
    </div>
    <div className="w-3/4 p-8 max-h-[500px] overflow-y-auto">
      <div className="grid grid-cols-4 gap-x-8">
        {Array(4)
          ?.fill(true)
          ?.map((_, index) => (
            <div key={index}>
              <Skeleton height={40} />
              <ul className="space-y-1 mt-4">
                {Array(8)
                  .fill(true)
                  ?.map((_, ind) => (
                    <li key={ind} className="py-1">
                      <Skeleton height={30} />
                    </li>
                  ))}
              </ul>

              <Skeleton height={20} className="mt-4" />
            </div>
          ))}
      </div>
    </div>
  </div>
);

export default function SubMenuPanelDropdown({
  handleDesktopMouseLeave,
  setActiveDesktopSubMenu,
  activeDesktopSubMenu,
  dropdownItem,
  isLoading,
}: {
  handleDesktopMouseLeave: () => void;
  setActiveDesktopSubMenu: any;
  activeDesktopSubMenu: string | null;
  dropdownItem: any;
  isLoading?: boolean;
}) {
  if (isLoading) return <SubMenuSkeleton />;

  const content = dropdownItem?.dropdownContent || {};

  return (
    <div className="flex">
      <div className="w-1/4 bg-(--main-emphasis) text-(--text-color-emphasis)">
        <ul className="py-4">
          {Object.keys(content).map((subMenuName) => (
            <li
              key={subMenuName}
              onMouseEnter={() => setActiveDesktopSubMenu(subMenuName)}
              className={`px-5 py-3 text-(--white) cursor-pointer text-sm ${
                activeDesktopSubMenu === subMenuName
                  ? "relative font-semibold after:border-l-(--main-emphasis) after:content-[''] after:block after:absolute after:top-1/2 after:-translate-y-1/2 after:left-full after:border-y-8 after:border-l-8 after:border-y-transparent"
                  : "font-medium"
              }`}
            >
              {subMenuName}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-3/4 p-8 max-h-[500px] overflow-y-auto">
        {activeDesktopSubMenu && content[activeDesktopSubMenu] ? (
          <div className="grid grid-cols-4 gap-x-8">
            {Object.values(content[activeDesktopSubMenu]).map(
              (section: any) => (
                <div key={section.title}>
                  <HeadingLine
                    title={section?.title}
                    className="font-semibold text-(--text-color-emphasis)!"
                  />
                  <ul className="space-y-1">
                    {section.links.slice(0, 16).map((link: any) => (
                      <li key={link.name} className="py-1">
                        <Link
                          href={link?.href || ""}
                          title={link?.name}
                          onClick={handleDesktopMouseLeave}
                          className="text-sm text-(--text-color) hover:text-(--main)"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {section.viewAll && (
                    <Link
                      href={section.viewAll}
                      title={`View All ${section.title}`}
                      onClick={handleDesktopMouseLeave}
                      className="text-sm text-(--main) hover:underline mt-4 inline-block"
                    >
                      VIEW ALL
                    </Link>
                  )}
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="text-center p-10">No details available.</div>
        )}
      </div>
    </div>
  );
}
