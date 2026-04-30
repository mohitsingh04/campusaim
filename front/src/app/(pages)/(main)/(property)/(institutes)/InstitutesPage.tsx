"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import FiltersContent from "./_institues_assests/_property_components/FiltersContent";
import InstituteCard from "./_institues_assests/_property_components/InstituteCard";
import MobileFiltersCanvas from "./_institues_assests/_property_components/MobileFilters";
import ResultsHeader from "./_institues_assests/_property_components/ResultsHeader";
import { useSearchParams, useRouter, notFound } from "next/navigation";
import {
  ExpandedFiltersProps,
  FilterSearchTermsProps,
  FiltersProps,
} from "@/types/PropertyFilterTypes";
import { PropertyProps } from "@/types/PropertyTypes";
import { CategoryProps } from "@/types/Types";
import {
  createDynamicFilterOptions,
  filterInstitutes,
} from "./_institues_assests/utils/filterUtils";
import { generateSlug, getAverageRating } from "@/context/Callbacks";
import Pagination from "@/ui/pagination/Pagination";
import InsitutesLoader from "@/ui/loader/page/institutes/Institutes";
import { GraduationCap } from "lucide-react";
import { useGetAssets } from "@/context/providers/AssetsProviders";
import useGetAllProperties from "@/hooks/fetch-hooks/useGetAllProperties";

const ITEMS_PER_PAGE = 18;

const getInitialFilters = (): FiltersProps => ({
  country: [],
  state: [],
  city: [],
  course_name: [],
  course_level: [],
  course_type: [],
  course_format: [],
  rating: [],
  approved_by: [],
  affiliated_by: [],
  property_type: [],
});

const getInitialSearchTerms = (): FilterSearchTermsProps => ({
  country: "",
  state: "",
  city: "",
  course_name: "",
  course_level: "",
  course_type: "",
  course_format: "",
  approved_by: "",
  affiliated_by: "",
  property_type: "",
});

const ExpandedFilterTerms: ExpandedFiltersProps = {
  country: true,
  state: true,
  city: true,
  course_name: true,
  course_level: true,
  course_type: true,
  course_format: true,
  rating: true,
  approved_by: true,
  affiliated_by: true,
  property_type: true,
};

export default function InstitutesPage({ pageCat }: { pageCat?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { allCategories } = useGetAssets();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("default");

  const wantedCategory = allCategories?.filter(
    (item: CategoryProps) =>
      generateSlug(item?.parent_category) === generateSlug("Academic Type"),
  );

  useEffect(() => {
    const urlCategoryParam = searchParams.get("category");
    if (!urlCategoryParam || wantedCategory.length === 0) return;
    const selectedCategories = urlCategoryParam.split(",").filter(Boolean);
    const allSlugsValid = selectedCategories.every((slug) =>
      wantedCategory.some((item) => generateSlug(item.category_name) === slug),
    );

    if (!allSlugsValid) {
      notFound();
    }
  }, [wantedCategory, searchParams]);

  const { allProperties, propertiesLoading } = useGetAllProperties({
    catFilter: pageCat,
    isShuffle: true,
  });

  const initializeFiltersFromURL = useCallback((): FiltersProps => {
    const urlFilters = getInitialFilters();

    Object.keys(urlFilters).forEach((key) => {
      const param = searchParams.get(key);
      if (param) {
        urlFilters[key as keyof FiltersProps] = param
          .split(",")
          .filter(Boolean);
      }
    });

    return urlFilters;
  }, [searchParams]);

  const [expandedFilters, setExpandedFilters] =
    useState<ExpandedFiltersProps>(ExpandedFilterTerms);

  const [filters, setFilters] = useState<FiltersProps>(
    initializeFiltersFromURL,
  );

  const [filterSearchTerms, setFilterSearchTerms] =
    useState<FilterSearchTermsProps>(getInitialSearchTerms());

  const updateURL = useCallback(
    (
      newFilters: FiltersProps,
      page: number = 1,
      currentSearchTerm: string = searchTerm,
    ) => {
      const params = new URLSearchParams();

      if (currentSearchTerm) {
        params.set("search", currentSearchTerm);
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

      router.push(`/institutes${newURL}`, { scroll: false });
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

  const clearFilters = () => {
    setFilters(getInitialFilters());
    setFilterSearchTerms(getInitialSearchTerms());
    updateURL(getInitialFilters(), 1, "");
  };

  const findParentLocations = useCallback(
    (selectedValue: string, filterType: "city" | "state") => {
      const parentLocations = { country: "", state: "" };

      for (const property of allProperties) {
        if (filterType === "city" && property.property_city === selectedValue) {
          parentLocations.country = property.property_country || "";
          parentLocations.state = property.property_state || "";
          break;
        } else if (
          filterType === "state" &&
          property.property_state === selectedValue
        ) {
          parentLocations.country = property.property_country || "";
          break;
        }
      }

      return parentLocations;
    },
    [allProperties],
  );

  const isDataReady = useMemo(() => {
    return (
      !propertiesLoading &&
      allProperties.length > 0 &&
      (allCategories?.length ?? 0) > 0
    );
  }, [propertiesLoading, allProperties, allCategories]);

  const dynamicFilterOptions = useMemo(
    () => createDynamicFilterOptions(allProperties),
    [allProperties],
  );

  const filteredInstitutes = useMemo(() => {
    if (!isDataReady) return [];

    let list = filterInstitutes(allProperties, searchTerm, filters);

    if (sortBy === "rating") {
      list = [...list].sort(
        (a, b) =>
          getAverageRating(b?.reviews || []) -
          getAverageRating(a?.reviews || []),
      );
    }

    if (sortBy === "A-Z") {
      list = [...list].sort((a, b) =>
        (a?.property_name || "")
          .toLowerCase()
          .localeCompare((b?.property_name || "").toLowerCase()),
      );
    }

    if (sortBy === "Z-A") {
      list = [...list].sort((a, b) =>
        (b?.property_name || "")
          .toLowerCase()
          .localeCompare((a?.property_name || "").toLowerCase()),
      );
    }

    return list;
  }, [isDataReady, allProperties, searchTerm, filters, sortBy]);

  const totalPages = Math.ceil(filteredInstitutes.length / ITEMS_PER_PAGE);
  const displayedInstitutes: PropertyProps[] = filteredInstitutes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const toggleFilter = (filterType: keyof ExpandedFiltersProps) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const handleCheckboxFilter = (
    filterType: keyof FiltersProps,
    value: string,
  ) => {
    const currentValues = filters[filterType] as string[];

    const newFilters = {
      ...filters,
      [filterType]: currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value],
    };

    if (!currentValues.includes(value)) {
      if (filterType === "city") {
        const parentLocations = findParentLocations(value, "city");
        if (
          parentLocations.state &&
          !newFilters.state.includes(parentLocations.state)
        ) {
          newFilters.state = [...newFilters.state, parentLocations.state];
        }
        if (
          parentLocations.country &&
          !newFilters.country.includes(parentLocations.country)
        ) {
          newFilters.country = [...newFilters.country, parentLocations.country];
        }
      } else if (filterType === "state") {
        const parentLocations = findParentLocations(value, "state");
        if (
          parentLocations.country &&
          !newFilters.country.includes(parentLocations.country)
        ) {
          newFilters.country = [...newFilters.country, parentLocations.country];
        }
      }
    }

    if (filterType === "country") {
      newFilters.state = [];
      newFilters.city = [];
    } else if (filterType === "state") {
      newFilters.city = [];
    }

    updateURL(newFilters, 1);
  };

  const handleFilterSearchChange = (
    filterType: keyof FilterSearchTermsProps,
    value: string,
  ) => {
    setFilterSearchTerms((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
  };

  if (propertiesLoading) return <InsitutesLoader />;

  return (
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
              totalResults={filteredInstitutes.length}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              onShowMobileFilters={() => setShowMobileFilters(true)}
              sortBy={sortBy}
              pageCat={pageCat}
              onSortChange={setSortBy}
            />

            <div className="flex-1 overflow-y-auto pr-1 pb-10">
              {isDataReady && displayedInstitutes.length <= 0 ? (
                <div className="text-center py-16 bg-(--primary-bg) rounded-custom shadow-custom">
                  <GraduationCap className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="heading font-bold mb-2">
                    No institutes found
                  </h3>
                  <p>Try adjusting your filters.</p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6"
                      : "space-y-6"
                  }
                >
                  {displayedInstitutes.map((item, i) => (
                    <InstituteCard
                      key={i}
                      institute={item}
                      isListView={viewMode === "list"}
                    />
                  ))}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div>
                <Pagination currentPage={currentPage} totalPages={totalPages} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
