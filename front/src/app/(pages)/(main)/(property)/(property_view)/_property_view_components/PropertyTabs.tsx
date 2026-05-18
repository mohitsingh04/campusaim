"use client";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { usePropertyTabsData } from "./PropertyTabData";
import { PropertyProps } from "@/types/PropertyTypes";
import { generateSlug } from "@/context/Callbacks";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useGetAssets } from "@/context/providers/AssetsProviders";

export default function PropertyTabs({
  property,
  tabexistence,
  category,
}: {
  property: PropertyProps | null;
  tabexistence: any;
  category: string;
}) {
  const router = useRouter();
  const { property_slug, property_tab } = useParams<{
    property_slug: string;
    property_tab?: string;
  }>();
  const { getCategoryById } = useGetAssets();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { scrollRef, startRef, endRef, canScrollLeft, canScrollRight, scroll } =
    useHorizontalScroll(200);

  const tabs = usePropertyTabsData({ property, getCategoryById, tabexistence });

  useEffect(() => {
    if (!property) return;

    const currentCategorySlug = generateSlug(
      getCategoryById(property?.academic_type) || "",
    );
    if (!currentCategorySlug) return;
    const matchedTab = property_tab
      ? tabs.find(
          (tab) => generateSlug(tab?.id || "") === generateSlug(property_tab),
        )
      : null;

    if (currentCategorySlug !== category || (property_tab && !matchedTab)) {
      router.replace(
        `/${currentCategorySlug}/${generateSlug(property_slug)}/overview`,
      );
      return;
    }

    if (matchedTab) {
      setActiveTab(matchedTab?.id);
    } else if (!property_tab) {
      setActiveTab("overview");
    }
  }, [
    property_tab,
    router,
    category,
    property_slug,
    getCategoryById,
    tabs,
    property,
  ]);

  const renderTab = useCallback(() => {
    const mainTab = tabs.find((tab) => tab.id === activeTab && tab?.show);
    if (!mainTab) {
      router.push(
        `/${generateSlug(category)}/${generateSlug(property_slug)}/overview`,
      );
      return null;
    }
    return mainTab.tab;
  }, [activeTab, tabs, router, category, property_slug]);

  return (
    <div>
      <div className="sticky top-15 px-1 sm:rounded-t-lg md:static z-40 bg-(--primary-bg) border-b border-(--border) shadow-custom">
        <div className="relative flex items-center group">
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-0 z-30 bg-(--primary-bg) ps-3 pe-2 transition md:hidden"
          >
            <MenuIcon className="text-(--text-color) h-5 w-5" />
          </button>

          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="hidden md:flex absolute left-0 z-20 p-1.5 bg-(--secondary-bg) shadow-md rounded-full border border-(--border) hover:bg-(--main-subtle) transition ml-2"
            >
              <ChevronLeftIcon className="text-(--text-color) w-5 h-5" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex items-center space-x-2 overflow-x-auto hide-scrollbar px-10 md:px-12 w-full"
          >
            <div ref={startRef} className="w-1 h-full shrink-0" />
            {tabs?.map((tab, index) => {
              if (!tab?.show) return null;
              const isActive = activeTab === tab.id;
              return (
                <Link
                  href={`/${generateSlug(category)}/${generateSlug(
                    property_slug,
                  )}/${generateSlug(tab.id)}`}
                  key={index}
                  className={`relative py-4 px-4 whitespace-nowrap cursor-pointer font-medium text-sm transition-all flex items-center gap-2 shrink-0 ${
                    isActive
                      ? "text-(--main-emphasis) bg-(--main-subtle) rounded-custom"
                      : "text-(--text-color) hover:text-(--main)"
                  }`}
                >
                  <tab.icon
                    className={`w-4 h-4 ${isActive ? "text-(--main-emphasis)" : "text-(--text-color)"}`}
                  />
                  {tab.label}
                </Link>
              );
            })}
            <div ref={endRef} className="w-1 h-full shrink-0" />
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="hidden md:flex absolute right-0 z-20 p-1.5 bg-(--secondary-bg) shadow-md rounded-full border border-(--border) hover:bg-(--main-subtle) transition mr-2"
            >
              <ChevronRightIcon className="text-(--text-color) w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-(--primary-bg) sm:rounded-b-lg shadow-custom overflow-hidden">
        {renderTab()}
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative bg-(--secondary-bg) text-(--text-color-emphasis) w-full p-6 overflow-y-auto">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-(--main) hover:bg-(--main-subtle)"
            >
              <XIcon />
            </button>

            <h3 className="text-lg font-bold mb-6">Menu</h3>
            <nav className="space-y-3">
              {tabs.map((tab) => {
                if (!tab?.show) return null;
                const isActive = activeTab === tab.id;
                return (
                  <Link
                    href={`/${generateSlug(category)}/${generateSlug(
                      property_slug,
                    )}/${generateSlug(tab.id)}`}
                    key={tab.id}
                    className={`flex items-center gap-3 w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isActive
                        ? "bg-(--main-subtle) text-(--main)"
                        : "text-(--text-color) bg-(--primary-bg) hover:bg-gray-100"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
