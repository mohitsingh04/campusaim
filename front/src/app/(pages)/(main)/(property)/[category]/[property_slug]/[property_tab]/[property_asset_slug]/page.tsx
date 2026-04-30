"use client";
import API from "@/context/API";
import { generateSlug } from "@/context/Callbacks";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PropertyCourseDetails from "./_property_asset_tab/PropertyCourse";
import TabLoading from "@/ui/loader/component/TabLoading";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { useGetPropertyDetails } from "@/context/providers/PropertyDetailsProvider";
import { useGetAssets } from "@/context/providers/AssetsProviders";
import { useQuery } from "@tanstack/react-query";
import { usePropertyTabsData } from "../_property_components/PropertyTabData";

export default function Page() {
  const { category, property_slug, property_tab } = useParams<{
    property_slug: string;
    property_tab?: string;
    category: string;
  }>();
  const { property } = useGetPropertyDetails();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { getCategoryById } = useGetAssets();
  const { scrollRef, startRef, endRef, canScrollLeft, canScrollRight, scroll } =
    useHorizontalScroll(200);

  const { data: tabexistence, isLoading: tabLoading } = useQuery({
    queryKey: ["property-tabs", property?._id],
    queryFn: async () => {
      const response = await API.get(
        `/property/tab/existence/${property?._id}`,
      );
      return response.data;
    },
    enabled: !!property?._id,
    staleTime: 1000 * 60 * 5,
  });
  const tabs = usePropertyTabsData({ property, getCategoryById, tabexistence });

  useEffect(() => {
    if (tabLoading || !property) return;

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
      setActiveTab(matchedTab.id);
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
    tabLoading,
  ]);

  if (tabLoading) return <TabLoading />;

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
            {tabs.map((tab) => {
              if (!tab?.show) return null;
              const isActive = activeTab === tab.id;
              return (
                <Link
                  href={`/${generateSlug(category)}/${generateSlug(
                    property_slug,
                  )}/${generateSlug(tab.id)}`}
                  key={tab.id}
                  className={`relative py-4 px-4 whitespace-nowrap cursor-pointer font-medium text-sm transition-all flex items-center gap-2 shrink-0 ${
                    isActive
                      ? "text-(--main-emphasis)"
                      : "text-(--text-color) hover:text-(--main)"
                  }`}
                >
                  <tab.icon
                    className={`w-4 h-4 ${isActive ? "text-(--main-emphasis)" : "text-(--text-color)"}`}
                  />
                  {tab.label}
                  {isActive && (
                    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-(--main-emphasis)"></span>
                  )}
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
        <PropertyCourseDetails />
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
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
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
