"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import FiltersContent from "./_exams_components/FiltersContent";
import MobileFiltersCanvas from "./_exams_components/MobileFilters";
import ResultsHeader from "./_exams_components/ResultsHeader";
import { useSearchParams, useRouter } from "next/navigation";
import { ExamProps, SeoProps } from "@/types/Types";
import { createDynamicFilterOptions, filterdExams } from "./utils/filterUtils";
import API from "@/context/API";
import {
  ExamFilterProps,
  ExpandedExamFiltersProps,
  FilterExamSearchTermsProps,
} from "@/types/ExamFilterTypes";
import {
  generateSlug,
  getErrorResponse,
  getMonthName,
  shuffleArray,
} from "@/context/Callbacks";
import Pagination from "@/ui/pagination/Pagination";
import InsitutesLoader from "@/ui/loader/page/institutes/Institutes";
import { GraduationCapIcon } from "lucide-react";
import ExamCard from "./_exams_components/ExamCard";
import { useGetAssets } from "@/context/providers/AssetsProviders";

const ITEMS_PER_PAGE = 12;

export default function ExamsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allExams, setAllExams] = useState<ExamProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const { getCategoryById } = useGetAssets();

  const initializeFiltersFromURL = useCallback((): ExamFilterProps => {
    const urlFilters: ExamFilterProps = {
      exam_mode: [],
      exam_type: [],
      exam_tag: [],
      upcoming_exam_month: [],
      result_month: [],
      application_month: [],
    };

    Object.keys(urlFilters).forEach((key) => {
      const param = searchParams.get(key);
      if (param) {
        urlFilters[key as keyof ExamFilterProps] = param
          .split(",")
          .filter(Boolean);
      }
    });

    return urlFilters;
  }, [searchParams]);

  const [expandedFilters, setExpandedFilters] =
    useState<ExpandedExamFiltersProps>({
      exam_mode: true,
      exam_type: true,
      exam_tag: true,
      upcoming_exam_month: true,
      result_month: true,
      application_month: true,
    });

  const [filters, setFilters] = useState<ExamFilterProps>(
    initializeFiltersFromURL,
  );

  const [filterSearchTerms, setFilterSearchTerms] =
    useState<FilterExamSearchTermsProps>({
      exam_mode: "",
      exam_type: "",
      exam_tag: "",
      upcoming_exam_month: "",
      result_month: "",
      application_month: "",
    });

  const updateURL = useCallback(
    (newFilters: ExamFilterProps, page: number = 1) => {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.set("search", searchTerm);
      }

      if (page > 1) {
        params.set("page", page.toString());
      }

      Object.entries(newFilters).forEach(([key, values]) => {
        if (values.length > 0) {
          params.set(key, values.join(","));
        }
      });

      const newURL = params.toString() ? `?${params.toString()}` : "";

      setTimeout(() => {
        router.push(`/exams${newURL}`, { scroll: false });
      }, 0);
    },
    [router, searchTerm],
  );

  useEffect(() => {
    const urlSearchTerm = searchParams.get("search") || "";
    const urlPage = parseInt(searchParams.get("page") || "1");

    setSearchTerm(urlSearchTerm);
    setCurrentPage(urlPage);
    setFilters(initializeFiltersFromURL());
  }, [searchParams, initializeFiltersFromURL]);

  const getAllExamsDetails = useCallback(async () => {
    setLoading(true);

    try {
      const [allExamsRes, allExamSeoRes] = await Promise.allSettled([
        API.get(`/exam`),
        API.get("/all/seo?type=exam"),
      ]);

      if (
        allExamsRes.status === "fulfilled" &&
        allExamSeoRes.status === "fulfilled"
      ) {
        const allExamsData = allExamsRes?.value?.data || [];
        const seoData = allExamSeoRes.value.data || [];

        const mergedExams = allExamsData.map((exa: ExamProps) => {
          const seoMatch = seoData.find(
            (seo: SeoProps) => seo.exam_id === exa._id,
          );

          return {
            ...exa,
            exam_mode: getCategoryById(exa?.exam_mode),
            exam_type: getCategoryById(exa?.exam_type),
            exam_tag: exa?.exam_tag?.map((tag) => getCategoryById(tag)),
            exam_slug: seoMatch ? seoMatch.slug : generateSlug(exa.exam_name),
            upcoming_exam_month: getMonthName(exa?.upcoming_exam_date?.date),
            result_month: getMonthName(exa?.result_date?.date),
            application_month: getMonthName(exa?.application_form_date?.start),
          };
        });
        setAllExams(shuffleArray(mergedExams));
      }
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [getCategoryById]);

  useEffect(() => {
    getAllExamsDetails();
  }, [getAllExamsDetails]);

  const dynamicFilterOptions = useMemo(
    () => createDynamicFilterOptions(allExams, searchTerm, filters),
    [allExams, searchTerm, filters],
  );

  const filteredExamsFound = useMemo(() => {
    let list = filterdExams(allExams, searchTerm, filters);

    if (sortBy === "A-Z") {
      list = [...list].sort((a, b) =>
        (a?.exam_name || a?.exam_name || "")
          .toLowerCase()
          .localeCompare((b?.exam_name || b?.exam_name || "").toLowerCase()),
      );
    }

    if (sortBy === "Z-A") {
      list = [...list].sort((a, b) =>
        (b?.exam_name || b?.exam_name || "")
          .toLowerCase()
          .localeCompare((a?.exam_name || a?.exam_name || "").toLowerCase()),
      );
    }

    return list;
  }, [searchTerm, filters, allExams, sortBy]);

  const totalPages = Math.ceil(filteredExamsFound.length / ITEMS_PER_PAGE);
  const displayedExams: ExamProps[] = filteredExamsFound.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const clearFilters = () => {
    const emptyFilters: ExamFilterProps = {
      exam_mode: [],
      exam_type: [],
      exam_tag: [],
      upcoming_exam_month: [],
      result_month: [],
      application_month: [],
    };

    setFilters(emptyFilters);
    setFilterSearchTerms({
      exam_mode: "",
      exam_type: "",
      exam_tag: "",
      upcoming_exam_month: "",
      result_month: "",
      application_month: "",
    });

    setCurrentPage(1);
    updateURL(emptyFilters, 1);
  };

  const toggleFilter = (filterType: keyof ExpandedExamFiltersProps) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const handleCheckboxFilter = (
    filterType: keyof ExamFilterProps,
    value: string,
  ) => {
    setFilters((prev) => {
      const currentValues = prev[filterType] as string[];

      const newFilters = {
        ...prev,
        [filterType]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };

      setCurrentPage(1);
      updateURL(newFilters, 1);
      return newFilters;
    });
  };

  const handleFilterSearchChange = (
    filterType: keyof FilterExamSearchTermsProps,
    value: string,
  ) => {
    setFilterSearchTerms((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
  };

  if (loading) return <InsitutesLoader />;

  return (
    <>
      <section className="bg-(--secondary-bg) text-(--text-color) py-8">
        <div className="container mx-auto px-4">
          <MobileFiltersCanvas
            isOpen={showMobileFilters}
            onClose={() => setShowMobileFilters(false)}
          >
            <FiltersContent
              dynamicFilterOptions={dynamicFilterOptions}
              filters={filters}
              filterSearchTerms={filterSearchTerms}
              expandedFilters={expandedFilters}
              onToggleFilter={toggleFilter}
              onCheckboxFilter={handleCheckboxFilter}
              onFilterSearchChange={handleFilterSearchChange}
              onClearAll={clearFilters}
            />
          </MobileFiltersCanvas>
          <div className="flex lg:flex-row gap-6 lg:min-h-[80vh] relative">
            <div className="hidden lg:block lg:w-80 bg-(--primary-bg) rounded-custom shadow-custom sticky top-20 max-h-screen! overflow-y-auto">
              <FiltersContent
                dynamicFilterOptions={dynamicFilterOptions}
                filters={filters}
                filterSearchTerms={filterSearchTerms}
                expandedFilters={expandedFilters}
                onToggleFilter={toggleFilter}
                onCheckboxFilter={handleCheckboxFilter}
                onFilterSearchChange={handleFilterSearchChange}
                onClearAll={clearFilters}
              />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <ResultsHeader
                totalResults={filteredExamsFound.length}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                onShowMobileFilters={() => setShowMobileFilters(true)}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
              <div className="flex-1 overflow-y-auto pr-1 pb-10">
                {displayedExams.length > 0 ? (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                        : "space-y-6"
                    }
                  >
                    {displayedExams.map((item, i) => (
                      <ExamCard
                        key={i}
                        exam={item}
                        isListView={viewMode === "list"}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-(--primary-bg) shadow-custom rounded-custom">
                    <GraduationCapIcon className="w-16 h-16 text-(--text-color) mx-auto mb-4" />
                    <h3 className="heading font-bold mb-2">No Exam found</h3>
                    <p>Try adjusting your filters</p>
                  </div>
                )}
              </div>
              {totalPages > 1 && (
                <div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
