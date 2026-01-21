"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { LuSearch, LuX, LuChevronRight, LuMic, LuMicOff } from "react-icons/lu";
import useSearchFetch from "@/app/(pages)/(main)/(search)/search/_hook/useSearchFetch";
import useSearchFilter from "@/app/(pages)/(main)/(search)/search/_hook/useSearchFilter";
import { IconType } from "react-icons";
import {
  FaBuilding,
  FaGraduationCap,
  FaPenFancy,
  FaRegNewspaper,
} from "react-icons/fa";
import { TbTimelineEvent } from "react-icons/tb";
import { BiFileFind } from "react-icons/bi";
import { useRotatingPlaceholder } from "@/hooks/useRotatingPlaceholder";
import { placeholderText } from "@/common/ExtraData";
import {
  generateSlug,
  getErrorResponse,
  shuffleArray,
} from "@/context/Callbacks";
import API from "@/context/API";
import Link from "next/link";
import { trendingSearches } from "@/common/TrendingSearches";
import HeadingLine from "@/ui/headings/HeadingLine";
import { useSpeechToText } from "@/hooks/useSpeechtoText";
import { FaUps } from "react-icons/fa6";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
  } = useSpeechToText();

  const { value: rotatePlaceHolder } = useRotatingPlaceholder(placeholderText);

  const trending = useMemo(
    () => shuffleArray(trendingSearches).slice(0, 10),
    []
  );

  const inputRef = useRef<HTMLInputElement | null>(null);

  const { properties, courses, blogs, events, news, keywordsList } =
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
    query: "",
    localSearch: searchTerm,
  });

  const [results, setResults] = useState<
    { Icon: IconType; title: string; href: string }[]
  >([]);

  /* 🎙️ voice → input sync */
  useEffect(() => {
    if (transcript) {
      setSearchTerm(transcript.trim());
      inputRef.current?.focus();
    }
  }, [transcript]);

  useEffect(() => {
    const combinedResults = [
      ...finalProps.map((item: any) => ({
        Icon: FaBuilding,
        title: item.property_name,
        href: `/${generateSlug(item?.category)}/${generateSlug(
          item?.property_slug
        )}/overview`,
      })),
      ...finalCourses.map((item: any) => ({
        Icon: FaGraduationCap,
        title: item.course_name,
        href: `/course/${generateSlug(item?.course_slug)}`,
      })),
      ...finalBlogs.map((item: any) => ({
        Icon: FaPenFancy,
        title: item.title,
        href: `/blog/${generateSlug(item?.blog_slug)}`,
      })),
      ...finalEvents.map((item: any) => ({
        Icon: TbTimelineEvent,
        title: item.title,
        href: `/event/${generateSlug(item?.event_slug)}`,
      })),
      ...finalNews.map((item: any) => ({
        Icon: FaRegNewspaper,
        title: item.title,
        href: `/news-and-updates/${generateSlug(item?.news_slug)}`,
      })),
      ...finalKeywords.map((item: any) => ({
        Icon: FaUps,
        title: item,
        href: `/${generateSlug(item)}`,
      })),
    ];

    setResults(combinedResults);
  }, [
    finalProps,
    finalCourses,
    finalBlogs,
    finalEvents,
    finalNews,
    finalKeywords,
  ]);

  const handleStoreSearch = useCallback(async (query: string) => {
    try {
      await API.post("/search", { search: query });
      setSearchTerm("");
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  const redirectToFullPage = useCallback(
    (query: string) => {
      router.push(`/search/${generateSlug(query)}`);
      handleStoreSearch(query);
      setSearchTerm("");
      onClose();
    },
    [router, handleStoreSearch, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && searchTerm.length >= 3)
        redirectToFullPage(searchTerm);
    },
    [redirectToFullPage, searchTerm]
  );

  const handleSearchButton = useCallback(() => {
    if (searchTerm.length >= 3) redirectToFullPage(searchTerm);
  }, [redirectToFullPage, searchTerm]);

  if (!isOpen) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-start justify-center mt-2 px-2 pointer-events-none">
        <div className="w-full max-w-4xl mx-auto pointer-events-auto">
          <div className="bg-(--primary-bg) relative text-(--text-color) rounded-custom shadow-custom border border-(--border) sm:max-h-[90vh] max-h-[99vh] flex flex-col overflow-y-scroll hide-scrollbar">
            <div className="sticky top-0 bg-(--primary-bg) px-4 py-3 flex justify-end">
              <button onClick={onClose}>
                <LuX className="w-4 h-4 text-(--main)" />
              </button>
            </div>

            <div className="px-4 pb-6 md:px-8">
              <form className="relative w-full">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LuSearch className="w-4 h-4" />
                  </div>

                  <input
                    ref={inputRef}
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Search "${rotatePlaceHolder}"`}
                    autoFocus
                    className="block w-full pl-10 pr-10 py-3 text-(--text-color-emphasis) border border-(--border) rounded-full text-xs bg-(--secondary-bg) shadow-custom placeholder-(--text-color)"
                  />

                  {/* 🎤 MIC BUTTON */}
                  {isSupported && (
                    <button
                      type="button"
                      onClick={isListening ? stopListening : startListening}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {isListening ? (
                        <div className="text-(--danger) p-1 animate-pulse bg-(--danger-subtle) rounded-full">
                          <LuMicOff className="w-5 h-5" />
                        </div>
                      ) : (
                        <LuMic className="w-5 h-5 text-(--text-color-emphasis)" />
                      )}
                    </button>
                  )}
                </div>

                {searchTerm.trim() !== "" && (
                  <div className="rounded-custom bg-(--secondary-bg) border border-(--border) shadow-custom overflow-hidden mt-2">
                    <div className="p-3 grid gap-2">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-2">
                          <BiFileFind /> Suggestions
                        </span>
                        <span>{results.length} results</span>
                      </div>

                      {results.slice(0, 6).map((s, i) => {
                        const Icon = s.Icon;
                        return (
                          <Link
                            key={i}
                            href={s.href}
                            onClick={() => {
                              handleStoreSearch(s.title);
                              onClose();
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-custom capitalize hover:bg-(--primary-bg)"
                          >
                            <Icon className="w-4 h-4 text-gray-400" />
                            <span className="text-xs">{s.title}</span>
                          </Link>
                        );
                      })}

                      {results.length > 6 && (
                        <button
                          type="button"
                          onClick={handleSearchButton}
                          className="w-full text-xs flex justify-center gap-1"
                        >
                          View all <LuChevronRight />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </form>

              <section className="mt-8">
                <HeadingLine title="Trending Searches" />
                <div className="flex flex-wrap gap-3">
                  {trending.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => redirectToFullPage(t.value)}
                      className="px-4 py-1.5 rounded-custom text-xs bg-(--secondary-bg)"
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
