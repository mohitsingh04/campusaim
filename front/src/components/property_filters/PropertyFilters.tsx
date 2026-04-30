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
import { GraduationCapIcon } from "lucide-react";
import { getAverageRating } from "@/context/Callbacks";

const ITEMS_PER_PAGE = 12;

const getInitialFilters = (): FiltersProps => ({
  country: [],
  state: [],
  city: [],
  course_name: [],
  course_level: [],
  course_type: [],
  course_format: [],
  rating: [],
  // academic_type: [],
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
  // academic_type: "",
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
  // academic_type: true,
  approved_by: true,
  affiliated_by: true,
  property_type: true,
};

export default function PropertyFilters({
  allProperties = [],
  propertyLoading,
  foundfor,
}: {
  allProperties: PropertyProps[];
  foundfor: string;
  propertyLoading: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pathname = usePathname();

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
    (newFilters: FiltersProps, page: number = 1) => {
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

      startTransition(() => {
        router.push(`${pathname}${newURL}`, { scroll: false });
      });
    },
    [router, searchTerm, pathname],
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
    updateURL(getInitialFilters(), 1);
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

  const dynamicFilterOptions = useMemo(
    () => createDynamicFilterOptions(allProperties),
    [allProperties],
  );
  const filteredInstitutes = useMemo(() => {
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
  }, [allProperties, searchTerm, filters, sortBy]);

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
              <ResultsHeader
                totalResults={filteredInstitutes.length}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                sortBy={sortBy}
                onSortChange={setSortBy}
                foundfor={foundfor}
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
                    <GraduationCapIcon className="w-16 h-16 text-(--text-color) mx-auto mb-4" />
                    <h3 className="heading font-bold mb-2">
                      No Institute found
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
