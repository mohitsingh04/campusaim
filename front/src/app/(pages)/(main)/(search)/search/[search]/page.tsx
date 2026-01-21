"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import useSearchFetch from "../_hook/useSearchFetch";
import useSearchFilter from "../_hook/useSearchFilter";

import {
  LuBookOpen,
  LuBuilding,
  LuGraduationCap,
  LuSearch,
} from "react-icons/lu";
import { BsNewspaper } from "react-icons/bs";
import { BiCalendarEvent } from "react-icons/bi";

import SearchList from "../_search_components/SearchList";
import Pagination from "@/ui/pagination/Pagination";
import SearchTabResult from "../_search_components/SearchTabResult";

import { SearchResult } from "@/types/Types";
import Loading from "@/ui/loader/Loading";

export default function Page() {
  const itemsPerPage = 10;

  const router = useRouter();
  const searchParams = useSearchParams();

  const { search } = useParams() as { search: string };

  const [activeTab, setActiveTab] = useState("all");

  const currentPage = Number(searchParams.get("page") || 1);

  const { properties, courses, blogs, events, news, keywordsList, loading } =
    useSearchFetch();
  const {
    finalProps,
    finalCourses,
    finalBlogs,
    finalEvents,
    finalNews,
    finalKeywords,
  } = useSearchFilter({
    properties,
    courses,
    blogs,
    events,
    news,
    keywordsList,
    query: search,
  });

  // Combine results for "All" tab
  const allResults: SearchResult[] = [
    ...finalProps.map((i) => ({ ...i, type: "property" as const })),
    ...finalCourses.map((i) => ({ ...i, type: "course" as const })),
    ...finalBlogs.map((i) => ({ ...i, type: "blog" as const })),
    ...finalEvents.map((i) => ({ ...i, type: "events" as const })),
    ...finalNews.map((i) => ({ ...i, type: "news-and-updates" as const })),
    ...finalKeywords.map((i) => ({
      type: "queries" as const,
      keyword: i,
    })),
  ];

  // Filter results based on active tab
  const visibleResults: SearchResult[] =
    activeTab === "property"
      ? finalProps.map((i) => ({ ...i, type: "property" }))
      : activeTab === "course"
      ? finalCourses.map((i) => ({ ...i, type: "course" }))
      : activeTab === "blog"
      ? finalBlogs.map((i) => ({ ...i, type: "blog" }))
      : activeTab === "events"
      ? finalEvents.map((i) => ({ ...i, type: "events" }))
      : activeTab === "news-and-updates"
      ? finalNews.map((i) => ({ ...i, type: "news-and-updates" }))
      : activeTab === "queries"
      ? finalKeywords.map((i) => ({ keyword: i, type: "queries" }))
      : allResults;
  // Pagination calculations
  const totalPages = Math.ceil(visibleResults.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = visibleResults.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset page to 1 when search input changes
  const resetPage = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-(--secondary-bg) text-(--text-color) mx-auto px-2 sm:px-8 py-6 space-y-6">
      <div className="container">
        {/* Tabs */}
        <SearchTabResult
          activeTab={activeTab}
          setActiveTab={(tab: string) => {
            setActiveTab(tab);
            resetPage();
          }}
          alltabs={[
            {
              key: "all",
              label: "All",
              icon: LuSearch,
              count: allResults.length,
            },
            {
              key: "property",
              label: "Institutes",
              icon: LuBuilding,
              count: finalProps.length,
            },
            {
              key: "course",
              label: "Courses",
              icon: LuGraduationCap,
              count: finalCourses.length,
            },
            {
              key: "blog",
              label: "Blogs",
              icon: LuBookOpen,
              count: finalBlogs.length,
            },
            {
              key: "events",
              label: "Events",
              icon: BiCalendarEvent,
              count: finalEvents.length,
            },
            {
              key: "news-and-updates",
              label: "News & Updates",
              icon: BsNewspaper,
              count: finalNews.length,
            },
            {
              key: "queries",
              label: "Queries",
              icon: BsNewspaper,
              count: keywordsList.length,
            },
          ]}
        />

        {/* Loader */}
        {loading && (
          <div className="py-6">
            <Loading />
          </div>
        )}

        <SearchList results={paginatedResults} />

        {/* No Results */}
        {!loading && allResults.length <= 0 && (
          <div className="text-center bg-(--primary-bg) mt-6 rounded-custom shadow-custom py-10">
            <LuSearch className="w-16 h-16 mx-auto mb-4 text-(--text-color-emphasis)" />
            <h2 className="sub-heading text-(--text-color) font-medium">
              No results found for &quot;
              <span className="font-bold">{search}</span>&quot;
            </h2>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10">
            <Pagination totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}
