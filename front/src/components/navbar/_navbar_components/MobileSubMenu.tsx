import { ArrowLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function MobileSubMenu({
  mobileSubMenu,
  mobileDetailMenu,
  setMobileSubMenu,
  handleCloseMobileMenu,
  handleDetailMenuClick,
  isLoading,
}: {
  handleDetailMenuClick: (e: React.MouseEvent, name: string, data: any) => void;
  handleCloseMobileMenu: () => void;
  mobileSubMenu: any;
  mobileDetailMenu: any;
  setMobileSubMenu: (val: any) => void;
  isLoading: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 transition-transform duration-300 bg-(--primary-bg) ${!mobileSubMenu ? "translate-x-full" : "translate-x-0"} ${mobileDetailMenu ? "-translate-x-full" : ""}`}
    >
      {mobileSubMenu && (
        <div className="h-full flex flex-col">
          <div className="p-4 bg-(--main-emphasis) flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-( --main-extra)">
              <button
                onClick={() => setMobileSubMenu(null)}
                aria-label="close-mobile-option-menu"
                className="p-1"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-lg">{mobileSubMenu.title}</h3>
            </div>
            <button
              onClick={handleCloseMobileMenu}
              aria-label="close-mobile-submenu"
              className="p-1 text-( --main-extra)"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <nav className="grow overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} height={50} className="rounded-md" />
                ))}
              </div>
            ) : (
              <ul className="flex flex-col">
                {Object.entries(mobileSubMenu.data || {}).map(
                  ([subItemName, subItemData]) => (
                    <li
                      key={subItemName}
                      className="border-b border-(--border)"
                    >
                      <Link
                        href="#"
                        onClick={(e) =>
                          handleDetailMenuClick(e, subItemName, subItemData)
                        }
                        title={subItemName}
                        className="flex justify-between items-center p-4"
                      >
                        <span>{subItemName}</span>
                        <ChevronRightIcon className="w-5 h-5 text-(--text-color)" />
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
