"use client";

import API from "@/context/API";
import {
  generateSlug,
  getAverageRating,
  getErrorResponse,
  getFieldDataSimple,
} from "@/context/Callbacks";
import {
  PropertyLocationProps,
  PropertyProps,
  PropertyRankProps,
  PropertyReviewProps,
} from "@/types/PropertyTypes";
import { CategoryProps } from "@/types/Types";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import KeywordPropertyCard from "./_keyword_components/PropertyCard";
import Breadcrumb from "@/ui/breadcrumbs/Breadcrumb";
import Pagination from "@/ui/pagination/Pagination";
import RelatedBlogs from "../../(blog)/blog/_allblog_components/RelatedBlogs";
import BlogCourse from "../../(blog)/blog/_allblog_components/BlogCourses";
import { FaGraduationCap } from "react-icons/fa";
import Loading from "@/ui/loader/Loading";

const ITEMS_PER_PAGE = 20;

export default function KeywordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = useMemo(
    () => Number(searchParams.get("page") || 1),
    [searchParams]
  );

  const { category: keyword_slug } = useParams<{ category: string }>();

  const [properties, setProperties] = useState<PropertyProps[]>([]);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [loading, setLoading] = useState(true);

  const [wantedCategory, setWantedCategory] = useState<CategoryProps[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [allStates, setAllStates] = useState<string[]>([]);
  const [allCountries, setAllCountries] = useState<string[]>([]);

  const [keywordCategory, setKeywordCategory] = useState("");
  const [keywordCity, setKeywordCity] = useState("");
  const [keywordState, setKeywordState] = useState("");
  const [keywordCountry, setKeywordCountry] = useState("");
  const [keywordLimit, setKeywordLimit] = useState<number | null>(null);
  const [isInvalidSearch, setIsInvalidSearch] = useState(false);

  const normalize = (text: string) =>
    text
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();

  /* ---------------- FETCH CATEGORIES ---------------- */
  const getCategories = useCallback(async () => {
    try {
      const response = await API.get(`/category`);
      setWantedCategory(
        response.data?.filter(
          (item: CategoryProps) =>
            generateSlug(item?.parent_category) ===
            generateSlug("Academic Type")
        )
      );
      setCategories(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const getCategoryById = useCallback(
    (id: string) => {
      const cat = categories.find(
        (item) => item.uniqueId === Number(id) || item._id === id
      );
      return cat?.category_name;
    },
    [categories]
  );

  /* ---------------- FETCH DATA ---------------- */
  const getAllPropertyDetails = useCallback(async () => {
    setLoading(true);
    if (!categories.length) return;

    try {
      const [propertyRes, locationRes, reviewRes, rankRes] =
        await Promise.allSettled([
          API.get(`/property`),
          API.get(`/locations`),
          API.get(`/review`),
          API.get(`/ranks`),
        ]);

      if (
        propertyRes.status === "fulfilled" &&
        locationRes.status === "fulfilled" &&
        reviewRes.status === "fulfilled" &&
        rankRes.status === "fulfilled"
      ) {
        const propertiesData =
          propertyRes.value.data.filter(
            (item: PropertyProps) => item.status === "Active"
          ) || [];

        const locationsData = locationRes.value.data || [];
        const reviewsData = reviewRes.value.data || [];
        const rankData = rankRes.value.data || [];

        const merged = propertiesData.map((property: PropertyProps) => {
          const location = locationsData.find(
            (loc: PropertyLocationProps) =>
              Number(loc.property_id) === property.uniqueId
          );

          const reviews = reviewsData.filter(
            (rev: PropertyReviewProps) =>
              Number(rev.property_id) === property.uniqueId
          );

          const rank = rankData.find(
            (r: PropertyRankProps) => String(r.property_id) === property._id
          );

          return {
            uniqueId: property.uniqueId,
            property_name: property.property_name,
            property_logo: property.property_logo,
            property_description: property.property_description,
            category: getCategoryById(property.category),
            property_city: location?.property_city,
            property_state: location?.property_state,
            property_country: location?.property_country,
            property_slug: property.property_slug,
            rank: rank?.rank || 0,
            reviews,
            rating: getAverageRating(reviews),
          };
        });

        setAllCities(getFieldDataSimple(merged, "property_city"));
        setAllStates(getFieldDataSimple(merged, "property_state"));
        setAllCountries(getFieldDataSimple(merged, "property_country"));

        setProperties(
          merged.sort(
            (a: PropertyProps, b: PropertyProps) =>
              (a.rank || 9999) - (b.rank || 9999)
          )
        );
      }
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [categories, getCategoryById]);

  useEffect(() => {
    getAllPropertyDetails();
  }, [getAllPropertyDetails]);

  /* ---------------- PARSING LOGIC ---------------- */
  // 1. Find Category First
  const hasCategoryMatch = useMemo(() => {
    if (!keyword_slug) return false;

    const slug = keyword_slug.toLowerCase();

    const matched = wantedCategory
      .map((item) => ({
        name: item.category_name,
        slug: generateSlug(item.category_name),
      }))
      .filter((item) => item.slug.split("-").every((p) => slug.includes(p)))
      .sort((a, b) => b.slug.length - a.slug.length)[0];

    if (matched) {
      setKeywordCategory(matched.name);
      return true;
    }

    setKeywordCategory("");
    return false;
  }, [keyword_slug, wantedCategory]);

  // 2. Parse Locations & Residuals
  useEffect(() => {
    if (!keyword_slug) return;

    const slug = keyword_slug.toLowerCase();

    if (!slug.includes("top") && !slug.includes("best")) {
      router.replace("/");
      return;
    }

    // Reset everything initially
    setIsInvalidSearch(false);
    setKeywordCity("");
    setKeywordState("");
    setKeywordCountry("");

    // Prepare temp string: replace hyphens with spaces for easier matching
    let tempCheckString = slug.replaceAll("-", " ");

    // Remove Prefix & Limit
    tempCheckString = tempCheckString
      .replace(/\b(top|best)\b/g, "")
      .replace(/\b\d+\b/g, "");

    // Remove Category
    if (keywordCategory) {
      const catSlug = generateSlug(keywordCategory).replaceAll("-", " ");
      tempCheckString = tempCheckString.replace(catSlug, "");
    }

    // --- UPDATED LOCATION LOGIC ---
    // Combine ALL locations into one list, map them to their type, and sort by LENGTH (Descending)
    // This prevents "Delhi" (State) from being matched inside "New Delhi" (City).
    const combinedLocations = [
      ...allCities.map((c) => ({
        val: c,
        type: "city",
        slug: generateSlug(c).replaceAll("-", " "),
      })),
      ...allStates.map((s) => ({
        val: s,
        type: "state",
        slug: generateSlug(s).replaceAll("-", " "),
      })),
      ...allCountries.map((c) => ({
        val: c,
        type: "country",
        slug: generateSlug(c).replaceAll("-", " "),
      })),
    ].sort((a, b) => b.slug.length - a.slug.length); // Sort Longest -> Shortest

    // Iterate and Extract
    combinedLocations.forEach((loc) => {
      // Use boundary regex to match whole words only
      const regex = new RegExp(`\\b${loc.slug}\\b`);
      
      if (regex.test(tempCheckString)) {
        // Match found! Set the appropriate state
        if (loc.type === "city") setKeywordCity(loc.val);
        if (loc.type === "state") setKeywordState(loc.val);
        if (loc.type === "country") setKeywordCountry(loc.val);

        // Remove from string so it's not matched again or counted as garbage
        tempCheckString = tempCheckString.replace(regex, "");
      }
    });

    // Final Cleanup of 'tempCheckString' to check for garbage
    tempCheckString = tempCheckString
      .replace(/\b(in)\b/g, "") // Remove 'in'
      .replace(/[^a-z0-9]/g, "") // Remove symbols
      .trim();

    // If string still has letters, it means we missed a location -> Invalid Search
    if (tempCheckString.length > 0) {
      setIsInvalidSearch(true);
    }

    const limitMatch = slug.match(/\b(?:top|best)[-\s]?(\d+)\b/);
    setKeywordLimit(limitMatch?.[1] ? Number(limitMatch[1]) : null);
  }, [
    keyword_slug,
    allCities,
    allStates,
    allCountries,
    keywordCategory,
    router,
  ]);

  /* ---------------- FILTERING ---------------- */

  const filteredProperties = properties
    .filter((property) => {
      if (isInvalidSearch) return false;
      if (!hasCategoryMatch) return false;

      const matchCategory =
        normalize(property.category) === normalize(keywordCategory);
      if (!matchCategory) return false;

      const matchCity = keywordCity
        ? normalize(property.property_city) === normalize(keywordCity)
        : true;

      const matchState = keywordState
        ? normalize(property.property_state) === normalize(keywordState)
        : true;

      const matchCountry = keywordCountry
        ? normalize(property.property_country) === normalize(keywordCountry)
        : true;

      return matchCity && matchState && matchCountry;
    })
    .slice(0, keywordLimit || undefined);

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);

  const safeCurrentPage = useMemo(() => {
    if (currentPage < 1) return 1;
    if (currentPage > totalPages && totalPages > 0) return 1;
    return currentPage;
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(safeCurrentPage));
      router.replace(`?${params.toString()}`);
    }
  }, [currentPage, safeCurrentPage, router, searchParams]);

  const displayedInstitutes = filteredProperties.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 bg-(--primary-bg)">
      <div className="mb-4 text-(--text-color-emphasis)">
        <h1 className="text-2xl font-semibold capitalize mb-2">
          {keyword_slug?.replaceAll("-", " ")}
        </h1>
        <Breadcrumb items={[{ label: keyword_slug?.replaceAll("-", " ") }]} />
      </div>

      {loading && <Loading />}

      {!loading && filteredProperties.length === 0 && (
        <div className="text-center py-16 bg-(--secondary-bg) text-(--text-color-emphasis) rounded-custom shadow-custom">
          <FaGraduationCap className="w-16 h-16 mx-auto mb-4" />
          <h3 className="heading font-bold mb-2">No institutes found</h3>
          <p>
            {isInvalidSearch
              ? "We couldn't find the location or category you were looking for."
              : "Try adjusting your filters."}
          </p>
        </div>
      )}

      {!loading && filteredProperties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-6 md:col-span-3">
            {displayedInstitutes.map((item, index) => (
              <KeywordPropertyCard
                key={item.uniqueId}
                property={item}
                index={(safeCurrentPage - 1) * ITEMS_PER_PAGE + index}
              />
            ))}
          </div>

          <div className="hidden md:block">
            <BlogCourse />
            <RelatedBlogs />
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={safeCurrentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}