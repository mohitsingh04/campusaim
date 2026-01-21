import {
  ExpandedFiltersProps,
  FilterSearchTermsProps,
  FiltersProps,
} from "@/types/PropertyFilterTypes";
import { PropertyProps } from "@/types/PropertyTypes";
import { useRouter, useSearchParams } from "next/navigation";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FaGraduationCap } from "react-icons/fa";
import InstituteCard from "./_property_components/InstituteCard";
import ResultsHeader from "./_property_components/ResultsHeader";
// import ActiveFilterTags from "./_property_components/ActiveFilters";
import FiltersContent from "./_property_components/FiltersContent";
import MobileFilters from "./_property_components/MobileFilters";
import {
  createDynamicFilterOptions,
  filterInstitutes,
} from "./utils/filterUtils";
import { usePathname } from "next/navigation";
import Pagination from "@/ui/pagination/Pagination";
import InsitutesLoader from "@/ui/loader/page/institutes/Institutes";

const ITEMS_PER_PAGE = 12;

export default function PropertyFilters({
  allProperties = [],
  propertyLoading,
}: {
  allProperties: PropertyProps[];
  propertyLoading: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const initializeFiltersFromURL = useCallback((): FiltersProps => {
    const urlFilters: FiltersProps = {
      country: [],
      state: [],
      city: [],
      course_name: [],
      course_level: [],
      course_type: [],
      course_format: [],
      rating: [],
      category: [],
      property_type: [],
    };

    // Parse URL parameters
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

  const [expandedFilters, setExpandedFilters] = useState<ExpandedFiltersProps>({
    country: true,
    state: true,
    city: true,
    course_name: true,
    course_level: true,
    course_type: true,
    course_format: true,
    rating: true,
    category: true,
    property_type: true,
  });

  const [filters, setFilters] = useState<FiltersProps>(
    initializeFiltersFromURL
  );

  const [filterSearchTerms, setFilterSearchTerms] =
    useState<FilterSearchTermsProps>({
      country: "",
      state: "",
      city: "",
      course_name: "",
      course_level: "",
      course_type: "",
      course_format: "",
      category: "",
      property_type: "",
    });

  const updateURL = useCallback(
    (newFilters: FiltersProps, page: number = 1) => {
      const params = new URLSearchParams();

      // Add search term if exists
      if (searchTerm) {
        params.set("search", searchTerm);
      }

      // Add page if not first page
      if (page > 1) {
        params.set("page", page.toString());
      }

      // Add filters
      Object.entries(newFilters).forEach(([key, values]) => {
        if (values.length > 0) {
          params.set(key, values.join(","));
        }
      });

      const newURL = params.toString() ? `?${params.toString()}` : "";

      // Use setTimeout to avoid updating during render
      startTransition(() => {
        router.push(`${pathname}${newURL}`, { scroll: false });
      });
    },
    [router, searchTerm, pathname]
  );

  useEffect(() => {
    const urlSearchTerm = searchParams.get("search") || "";
    const urlPage = parseInt(searchParams.get("page") || "1");
    const newFilters = initializeFiltersFromURL();

    startTransition(() => {
      setSearchTerm(urlSearchTerm);
      setCurrentPage(urlPage);
      setFilters(newFilters);
    });
  }, [searchParams, initializeFiltersFromURL]);

  const findParentLocations = useCallback(
    (selectedValue: string, filterType: "city" | "state") => {
      const parentLocations = { country: "", state: "" };

      for (const property of allProperties || []) {
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
    [allProperties]
  );

  const dynamicFilterOptions = useMemo(
    () => createDynamicFilterOptions(allProperties),
    [allProperties]
  );

  const filteredInstitutes = useMemo(() => {
    return filterInstitutes(allProperties, searchTerm, filters);
  }, [searchTerm, filters, allProperties]);

  // Calculate total pages and slice institutes for the current page
  const totalPages = Math.ceil(filteredInstitutes.length / ITEMS_PER_PAGE);
  const displayedInstitutes: PropertyProps[] = filteredInstitutes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    const emptyFilters: FiltersProps = {
      country: [],
      state: [],
      city: [],
      course_name: [],
      course_level: [],
      course_type: [],
      course_format: [],
      rating: [],
      category: [],
      property_type: [],
    };

    setFilters(emptyFilters);
    setFilterSearchTerms({
      country: "",
      state: "",
      city: "",
      course_name: "",
      course_level: "",
      course_type: "",
      course_format: "",
      category: "",
      property_type: "",
    });
    setCurrentPage(1);
    updateURL(emptyFilters, 1);
  };

  const toggleFilter = (filterType: keyof ExpandedFiltersProps) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const handleCheckboxFilter = (
    filterType: keyof FiltersProps,
    value: string
  ) => {
    setFilters((prev) => {
      const currentValues = prev[filterType] as string[];

      const newFilters = {
        ...prev,
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

          // Auto-select country if not already selected
          if (
            parentLocations.country &&
            !newFilters.country.includes(parentLocations.country)
          ) {
            newFilters.country = [
              ...newFilters.country,
              parentLocations.country,
            ];
          }
        } else if (filterType === "state") {
          const parentLocations = findParentLocations(value, "state");

          // Auto-select country if not already selected
          if (
            parentLocations.country &&
            !newFilters.country.includes(parentLocations.country)
          ) {
            newFilters.country = [
              ...newFilters.country,
              parentLocations.country,
            ];
          }
        }
      }

      // Clear dependent filters when parent location changes (existing logic)
      if (filterType === "country") {
        newFilters.state = [];
        newFilters.city = [];
      } else if (filterType === "state") {
        newFilters.city = [];
      }

      setCurrentPage(1);
      updateURL(newFilters, 1);
      return newFilters;
    });
  };

  // const removeFilterTag = (filterType: keyof FiltersProps, value: string) => {
  //   setFilters((prev) => {
  //     const newFiltersForRemove = {
  //       ...prev,
  //       [filterType]: prev[filterType].filter((item) => item !== value),
  //     };
  //     updateURL(newFiltersForRemove, currentPage);
  //     return newFiltersForRemove;
  //   });
  // };

  const handleFilterSearchChange = (
    filterType: keyof FilterSearchTermsProps,
    value: string
  ) => {
    setFilterSearchTerms((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
  };

  if (propertyLoading) return <InsitutesLoader />;

  return (
    <>
      <section className="bg-(--secondary-bg) text-(--text-color) py-8">
        <div className="container mx-auto px-4">
          <MobileFilters
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
          </MobileFilters>
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
              {/* <ActiveFilterTags
                  filters={filters}
                  onRemoveFilter={removeFilterTag}
                  onClearAll={clearFilters}
                /> */}
              <ResultsHeader
                totalResults={filteredInstitutes.length}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                onShowMobileFilters={() => setShowMobileFilters(true)}
              />
              <div className="flex-1 overflow-y-auto pr-1 pb-10">
                {displayedInstitutes.length > 0 ? (
                  <div
                    className={`${
                      viewMode === "grid"
                        ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                        : "space-y-6"
                    }`}
                  >
                    {displayedInstitutes.map((institute, index) => (
                      <InstituteCard
                        key={index}
                        institute={institute}
                        isListView={viewMode === "list"}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-(--primary-bg) shadow-custom rounded-2xl">
                    <FaGraduationCap className="w-16 h-16 text-(--text-color) mx-auto mb-4" />
                    <h3 className="heading font-bold mb-2">
                      No institutes found
                    </h3>
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
