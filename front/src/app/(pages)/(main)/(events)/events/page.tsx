"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { FaGraduationCap } from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";
import { EventProps } from "@/types/Types";
import { createDynamicFilterOptions, filterdEvents } from "./utils/filterUtils";
import API from "@/context/API";
import { getErrorResponse, isDateEnded } from "@/context/Callbacks";
import Pagination from "@/ui/pagination/Pagination";
import MobileFilters from "./_events_components/MobileFilters";
import FiltersContent from "./_events_components/FiltersContent";
// import ActiveFilterTags from "./_events_components/ActiveFilters";
import ResultsHeader from "./_events_components/ResultsHeader";
import EventCard from "./_events_components/EventCard";
import {
  eventFilterProps,
  ExpandedEventFiltersProps,
  FilterEventSearchTermsProps,
} from "@/types/EventFilterTypes";
import { getProfile } from "@/context/getAssets";
import { UserProps } from "@/types/UserTypes";
import InsitutesLoader from "@/ui/loader/page/institutes/Institutes";

const ITEMS_PER_PAGE = 12;

export default function EventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allEvent, setAllEvent] = useState<EventProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProps | null>(null);
  const [profileloading, setProfileLoading] = useState(true);

  // authoritative flag: true only when data successfully loaded
  const [dataReady, setDataReady] = useState(false);

  const getProfileUser = useCallback(async () => {
    setProfileLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      getErrorResponse(error);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    getProfileUser();
  }, [getProfileUser]);

  const initializeFiltersFromURL = useCallback((): eventFilterProps => {
    const urlFilters: eventFilterProps = {
      entrance_type: [],
      calendar_group: [],
      event_city: [],
      event_country: [],
      event_state: [],
    };

    // Parse URL parameters
    Object.keys(urlFilters).forEach((key) => {
      const param = searchParams.get(key);
      if (param) {
        urlFilters[key as keyof eventFilterProps] = param
          .split(",")
          .filter(Boolean);
      }
    });

    return urlFilters;
  }, [searchParams]);

  const [expandedFilters, setExpandedFilters] =
    useState<ExpandedEventFiltersProps>({
      entrance_type: true,
      calendar_group: true,
      event_city: true,
      event_country: true,
      event_state: true,
    });

  const [filters, setFilters] = useState<eventFilterProps>(
    initializeFiltersFromURL
  );

  const [filterSearchTerms, setFilterSearchTerms] =
    useState<FilterEventSearchTermsProps>({
      entrance_type: "",
      calendar_group: "",
      event_city: "",
      event_country: "",
      event_state: "",
    });

  // Update URL when filters change - Fixed to prevent render cycle issues
  const updateURL = useCallback(
    (newFilters: eventFilterProps, page: number = 1) => {
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
      setTimeout(() => {
        router.push(`/events${newURL}`, { scroll: false });
      }, 0);
    },
    [router, searchTerm]
  );

  // Initialize from URL on mount
  useEffect(() => {
    const urlSearchTerm = searchParams.get("search") || "";
    const urlPage = parseInt(searchParams.get("page") || "1");

    setSearchTerm(urlSearchTerm);
    setCurrentPage(urlPage);
    setFilters(initializeFiltersFromURL());
  }, [searchParams, initializeFiltersFromURL]);

  const findParentLocations = useCallback(
    (selectedValue: string, filterType: "city" | "state") => {
      const parentLocations = { country: "", state: "" };

      for (const event of allEvent) {
        if (filterType === "city" && event.event_city === selectedValue) {
          parentLocations.country = event.event_country || "";
          parentLocations.state = event.event_state || "";
          break;
        } else if (
          filterType === "state" &&
          event.event_state === selectedValue
        ) {
          parentLocations.country = event.event_country || "";
          break;
        }
      }

      return parentLocations;
    },
    [allEvent]
  );

  const getAllEventDetails = useCallback(async () => {
    setDataReady(false);
    setLoading(true);

    try {
      const [allEventRes, allEventsSeoRes] = await Promise.allSettled([
        API.get("/events"),
        API.get("/all/seo?type=event"),
      ]);

      if (
        allEventRes.status !== "fulfilled" ||
        allEventsSeoRes.status !== "fulfilled"
      ) {
        setDataReady(false);
        return;
      }

      const allEventData = allEventRes.value.data || [];
      const seoData = allEventsSeoRes.value.data || [];

      const uCity = profile?.city?.trim().toLowerCase() ?? null;
      const uState = profile?.state?.trim().toLowerCase() ?? null;
      const uCountry = profile?.country?.trim().toLowerCase() ?? null;

      const activeEvents = allEventData.filter((event: EventProps) => {
        if (event?.status !== "Active") return false;
        return isDateEnded(
          event?.schedule?.[event?.schedule?.length - 1]?.date
        );
      });

      const mergedEvent = activeEvents.map((event: EventProps) => {
        const seoMatch = seoData.find((seo: any) => seo.event_id === event._id);

        const firstDate = event?.schedule?.[0]?.date
          ? new Date(event.schedule[0].date)
          : null;

        const calendar_group = firstDate
          ? firstDate.toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })
          : "No Date";

        let location_score = 3;

        if (profile) {
          const eCity = event.event_city?.trim().toLowerCase() || "";
          const eState = event.event_state?.trim().toLowerCase() || "";
          const eCountry = event.event_country?.trim().toLowerCase() || "";

          if (uCity && uCity === eCity) location_score = 0;
          else if (uState && uState === eState) location_score = 1;
          else if (uCountry && uCountry === eCountry) location_score = 2;
        }

        return {
          ...event,
          event_slug: seoMatch?.slug || "",
          calendar_group,
          first_event_date: firstDate ? firstDate.getTime() : Infinity,
          location_score,
        };
      });

      // ✅ hide events without slug
      const filteredEvents = mergedEvent.filter(
        (e: any) => e.event_slug && e.event_slug.trim() !== ""
      );

      const sortedEvents = filteredEvents.sort((a: any, b: any) => {
        if (profile && a.location_score !== b.location_score) {
          return a.location_score - b.location_score;
        }
        return a.first_event_date - b.first_event_date;
      });

      setAllEvent(sortedEvents);
      setDataReady(true);
    } catch (error) {
      getErrorResponse(error, true);
      setDataReady(false);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    getAllEventDetails();
  }, [getAllEventDetails]);

  // Dynamic filter options
  const dynamicFilterOptions = useMemo(
    () => createDynamicFilterOptions(allEvent),
    [allEvent]
  );

  // Only compute filters when dataReady to avoid false "no results" state
  const filteredEventFound = useMemo(() => {
    if (!dataReady) return [];
    return filterdEvents(allEvent, searchTerm, filters);
  }, [searchTerm, filters, allEvent, dataReady]);

  const totalPages = Math.ceil(filteredEventFound.length / ITEMS_PER_PAGE);
  const displayedEvents: EventProps[] = filteredEventFound.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    const emptyFilters: eventFilterProps = {
      entrance_type: [],
      calendar_group: [],
      event_city: [],
      event_country: [],
      event_state: [],
    };

    setFilters(emptyFilters);
    setFilterSearchTerms({
      entrance_type: "",
      calendar_group: "",
      event_city: "",
      event_country: "",
      event_state: "",
    });
    setCurrentPage(1);
    updateURL(emptyFilters, 1);
  };

  const toggleFilter = (filterType: keyof ExpandedEventFiltersProps) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const handleCheckboxFilter = (
    filterType: keyof eventFilterProps,
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
        if (filterType === "event_city") {
          const parentLocations = findParentLocations(value, "city");
          if (
            parentLocations.state &&
            !newFilters.event_state.includes(parentLocations.state)
          ) {
            newFilters.event_state = [
              ...newFilters.event_state,
              parentLocations.state,
            ];
          }

          // Auto-select country if not already selected
          if (
            parentLocations.country &&
            !newFilters.event_country.includes(parentLocations.country)
          ) {
            newFilters.event_country = [
              ...newFilters.event_country,
              parentLocations.country,
            ];
          }
        } else if (filterType === "event_state") {
          const parentLocations = findParentLocations(value, "state");

          // Auto-select country if not already selected
          if (
            parentLocations.country &&
            !newFilters.event_country.includes(parentLocations.country)
          ) {
            newFilters.event_country = [
              ...newFilters.event_country,
              parentLocations.country,
            ];
          }
        }
      }

      // Clear dependent filters when parent location changes (existing logic)
      if (filterType === "event_country") {
        newFilters.event_state = [];
        newFilters.event_city = [];
      } else if (filterType === "event_state") {
        newFilters.event_city = [];
      }

      setCurrentPage(1);
      updateURL(newFilters, 1);
      return newFilters;
    });
  };

  // const removeFilterTag = (
  //   filterType: keyof eventFilterProps,
  //   value: string
  // ) => {
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
    filterType: keyof FilterEventSearchTermsProps,
    value: string
  ) => {
    setFilterSearchTerms((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
  };

  // RETURN LOADER when data is not successfully loaded or profile is still loading
  if (!dataReady || loading || profileloading) {
    return <InsitutesLoader />;
  }

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
                totalResults={filteredEventFound.length}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                onShowMobileFilters={() => setShowMobileFilters(true)}
              />
              <div className="flex-1 overflow-y-auto pr-1 pb-10">
                {displayedEvents.length > 0 ? (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                        : "space-y-6"
                    }
                  >
                    {displayedEvents.map((item, i) => (
                      <EventCard
                        key={i}
                        event={item}
                        isListView={viewMode === "list"}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-(--primary-bg) shadow-custom rounded-custom">
                    <FaGraduationCap className="w-16 h-16 text-() mx-auto mb-4" />
                    <h3 className="heading font-bold mb-2">No Event found</h3>
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
