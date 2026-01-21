"use client";
import React, { useRef, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { generateSlug } from "@/context/Callbacks";
import { UserProps } from "@/types/UserTypes";

interface TabType {
  label: string;
  icon?: React.ElementType;
  tab?: any;
}

const SettingsTabs: React.FC<{
  tabs?: TabType[] | null;
  profile?: UserProps | null;
}> = ({ tabs, profile }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // handle empty tabs later in return
  const firstTabSlug = tabs?.length ? generateSlug(tabs[0].label) : "";
  const urlTab = searchParams.get("tab") || firstTabSlug;

  const [activeTab, setActiveTab] = useState(urlTab);

  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  useEffect(() => {
    if (!tabs?.length) return;

    if (!searchParams.get("tab")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", firstTabSlug);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [tabs, searchParams, firstTabSlug, pathname, router]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleTabClick = (label: string) => {
    const slug = generateSlug(label);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", slug);
    router.push(`${pathname}?${params.toString()}`);
  };

  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    window.addEventListener("resize", checkScroll);
    el.addEventListener("scroll", checkScroll);

    return () => {
      window.removeEventListener("resize", checkScroll);
      el.removeEventListener("scroll", checkScroll);
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const activeEl = el.querySelector(
      `[data-tab="${activeTab}"]`
    ) as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeTab]);

  const scrollBy = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  const selectedTab = tabs?.find((t) => generateSlug(t.label) === activeTab);

  // 💡 SAFE CONDITIONAL RETURN (AFTER HOOKS)
  if (!tabs || tabs.length === 0) return null;

  return (
    <>
      <div className="mb-4 sm:mb-8">
        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scrollBy(-200)}
              className="absolute left-0 top-0 bottom-0 z-10 w-8 bg-linear-to-r from-gray-950 to-transparent flex items-center justify-start text-white"
            >
              <BiChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="overflow-x-auto hide-scrollbar" ref={scrollRef}>
            <div className="flex items-center gap-2 whitespace-nowrap px-1">
              {tabs.map((tab, i) => {
                const slug = generateSlug(tab.label);
                const isActive = slug === activeTab;
                const Icon = tab.icon;

                return (
                  <button
                    key={i}
                    data-tab={slug}
                    onClick={() => handleTabClick(tab.label)}
                    className={`flex items-center gap-1 px-4 py-2 my-1 text-xs cursor-pointer rounded-full shrink-0
                      ${
                        isActive
                          ? "bg-(--main-emphasis) text-(--main-light)"
                          : "text-(--main-emphasis) bg-(--main-light) shadow-sm backdrop-blur-md hover:opacity-80"
                      }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {canScrollRight && (
            <button
              onClick={() => scrollBy(200)}
              className="absolute right-0 top-0 bottom-0 z-10 w-8 bg-linear-to-l from-gray-950 to-transparent flex items-center justify-end text-white"
            >
              <BiChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {selectedTab?.tab ? <selectedTab.tab profile={profile} /> : null}
    </>
  );
};

export default SettingsTabs;
