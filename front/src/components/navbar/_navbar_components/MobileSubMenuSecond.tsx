import { NavbarMobileDetailMenuState } from "@/types/NavbarTypes";
import HeadingLine from "@/ui/headings/HeadingLine";
import { ArrowLeftIcon, ChevronDownIcon, XIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function MobileSubMenuSecond({
  mobileDetailMenu,
  setMobileDetailMenu,
  handleCloseMobileMenu,
  activeAccordion,
  setActiveAccordion,
}: {
  activeAccordion: string | null;
  setActiveAccordion: React.Dispatch<React.SetStateAction<string | null>>;
  handleCloseMobileMenu: () => void;
  mobileDetailMenu: NavbarMobileDetailMenuState | null;
  setMobileDetailMenu: React.Dispatch<React.SetStateAction<any>>;
}) {
  return (
    <div
      className={`absolute inset-0 transition-transform duration-300 bg-(--primary-bg) ${
        !mobileDetailMenu ? "translate-x-full" : "translate-x-0"
      }`}
    >
      {mobileDetailMenu && (
        <div className="h-full flex flex-col">
          <div className="p-4 bg-(--main-emphasis) flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-( --main-extra)">
              <button
                onClick={() => setMobileDetailMenu(null)}
                aria-label="mobile-detail-menu"
                className="p-1"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>

              <h3 className="font-semibold text-lg">
                {mobileDetailMenu.title}
              </h3>
            </div>

            <button
              onClick={handleCloseMobileMenu}
              aria-label="mobile-submenu-close"
              className="p-1 text-( --main-extra)"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <nav className="grow overflow-y-auto p-2">
            {Object.entries(mobileDetailMenu.data).map(
              ([accordionTitle, accordionContent]) => {
                const isAccordionOpen = activeAccordion === accordionTitle;

                return (
                  <div
                    key={accordionTitle}
                    className="border-b border-(--border)"
                  >
                    <button
                      onClick={() =>
                        setActiveAccordion(
                          isAccordionOpen ? null : accordionTitle,
                        )
                      }
                      aria-label="mobile-active-accordion"
                      className="w-full flex justify-between items-center p-3 font-semibold text-left"
                    >
                      <HeadingLine
                        title={accordionContent?.title}
                        className="m-0!"
                      />
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform ${
                          isAccordionOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isAccordionOpen && (
                      <div className="p-3">
                        <ul className="space-y-2">
                          {accordionContent.links.map((link, index) => (
                            <li key={index}>
                              <Link
                                href={link?.href || ""}
                                title={link?.name}
                                onClick={handleCloseMobileMenu}
                                className="text-sm text-(--text-color) hover:text-(--main)"
                              >
                                {link.name}
                              </Link>
                            </li>
                          ))}

                          {accordionContent.viewAll && (
                            <li>
                              <Link
                                href={accordionContent.viewAll}
                                title={`View All ${accordionContent.title}`}
                                onClick={handleCloseMobileMenu}
                                className="text-sm text-(--main) hover:underline inline-block font-semibold mt-2"
                              >
                                VIEW ALL
                              </Link>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
