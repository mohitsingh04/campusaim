"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import useSearchFetch from "../_hook/useSearchFetch";
import useSearchFilter from "../_hook/useSearchFilter";

import SearchList from "../_search_components/SearchList";
import Pagination from "@/ui/pagination/Pagination";
import SearchTabResult from "../_search_components/SearchTabResult";

import { SearchResult } from "@/types/Types";
import Loading from "@/ui/loader/Loading";
import {
  BookOpenIcon,
  BuildingIcon,
  GraduationCapIcon,
  NewspaperIcon,
  SearchIcon,
} from "lucide-react";

export default function Page() {
  const itemsPerPage = 10;

  const router = useRouter();
  const searchParams = useSearchParams();

  const { search } = useParams() as { search: string };

  const [activeTab, setActiveTab] = useState("all");

  const currentPage = Number(searchParams.get("page") || 1);

  const { properties, courses, blogs, news, keywordsList, loading } =
    useSearchFetch({ isFetch: true });
  const { finalProps, finalCourses, finalBlogs, finalNews, finalKeywords } =
    useSearchFilter({
      properties,
      courses,
      blogs,
      news,
      keywordsList,
      query: search,
    });

  // Combine results for "All" tab
  const allResults: SearchResult[] = [
    ...finalProps.map((i) => ({ ...i, type: "property" as const })),
    ...finalCourses.map((i) => ({ ...i, type: "course" as const })),
    ...finalBlogs.map((i) => ({ ...i, type: "blog" as const })),
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
    startIndex + itemsPerPage,
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
              icon: SearchIcon,
              count: allResults.length,
            },
            {
              key: "property",
              label: "Institutes",
              icon: BuildingIcon,
              count: finalProps.length,
            },
            {
              key: "course",
              label: "Courses",
              icon: GraduationCapIcon,
              count: finalCourses.length,
            },
            {
              key: "blog",
              label: "Blogs",
              icon: BookOpenIcon,
              count: finalBlogs.length,
            },
            {
              key: "news-and-updates",
              label: "News & Updates",
              icon: NewspaperIcon,
              count: finalNews.length,
            },
            {
              key: "queries",
              label: "Queries",
              icon: NewspaperIcon,
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
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-(--text-color-emphasis)" />
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
