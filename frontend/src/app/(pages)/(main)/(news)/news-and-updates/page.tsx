"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LuSearch } from "react-icons/lu";
import API from "@/contexts/API";
import { stripHtmlAndLimit } from "@/contexts/Callbacks";
import { NewsProps } from "@/types/types";
import Breadcrumb from "@/components/breadcrumbs/breadcrumbs";
import BlogLoader from "@/components/Loader/Blog/BlogLoader";
import FeaturedNews from "./_all_news_components/FeaturedNews";
import NewsCard from "./_all_news_components/NewsCard";
import Pagination from "./_all_news_components/Pagination";

const NewsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNews, setFilteredNews] = useState<NewsProps[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 6;
  const [newsAndUpdates, setNewsAndUpdates] = useState<NewsProps[]>([]);
  const [loading, setLoading] = useState(true);

  const getNews = useCallback(async () => {
    setLoading(false);
    try {
      const response = await API.get(`/news-and-updates`);
      const data = response.data.filter(
        (item: NewsProps) => item.status === "Published"
      );

      setNewsAndUpdates(data);
      setFilteredNews(
        data.filter((_: NewsProps[], index: number) => index !== 0)
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getNews();
  }, [getNews]);

  const featuredNews = newsAndUpdates[0];
  const regularNews = useMemo(
    () => newsAndUpdates.filter((_, index) => index !== 0),
    [newsAndUpdates]
  );

  useEffect(() => {
    let filtered = regularNews;

    if (searchTerm) {
      filtered = filtered.filter(
        (news) =>
          news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stripHtmlAndLimit(news?.content)
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNews(filtered);
    setCurrentPage(1);
  }, [searchTerm, regularNews]);

  const totalPages = Math.ceil(filteredNews.length / newsPerPage);
  const startIndex = (currentPage - 1) * newsPerPage;
  const currentNews = filteredNews.slice(startIndex, startIndex + newsPerPage);

  return (
    <div>
      {!loading ? (
        <div className="bg-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div>
              <Breadcrumb items={[{ label: "News and Updates" }]} />
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            {featuredNews && currentPage === 1 && (
              <FeaturedNews update={featuredNews} />
            )}
            <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md w-full">
                  <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search news"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  />
                </div>
                <div>
                  <p className="text-gray-600 flex items-center space-x-2">
                    <span>
                      {filteredNews.length === regularNews.length ? (
                        <>
                          Showing all{" "}
                          <span className="font-bold text-purple-600">
                            {filteredNews.length}
                          </span>{" "}
                          News
                        </>
                      ) : (
                        `Found ${filteredNews.length} new${
                          filteredNews.length !== 1 ? "s" : ""
                        }`
                      )}
                    </span>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="text-purple-600 bg-purple-50 px-3 py-2 rounded-xl hover:text-purple-700 text-sm font-medium flex items-center cursor-pointer hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`}
            >
              {currentNews.map((update, index) => (
                <NewsCard key={index} update={update} index={index} />
              ))}
            </div>

            {filteredNews.length === 0 && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LuSearch className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No news found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search terms to discover great content.
                  </p>
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      ) : (
        <BlogLoader />
      )}
    </div>
  );
};

export default NewsPage;
