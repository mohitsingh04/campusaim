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
import Loading from "@/ui/loader/Loading";
import { GraduationCapIcon } from "lucide-react";
import { useGetAssets } from "@/context/providers/AssetsProviders";

const ITEMS_PER_PAGE = 20;

export default function KeywordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = useMemo(
    () => Number(searchParams.get("page") || 1),
    [searchParams],
  );

  const { category: keyword_slug } = useParams<{ category: string }>();

  const { allCategories, getCategoryById } = useGetAssets();
  const [properties, setProperties] = useState<PropertyProps[]>([]);
  const [loading, setLoading] = useState(true);

  const [wantedAcademicTypes, setWantedAcademicTypes] = useState<
    CategoryProps[]
  >([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [allStates, setAllStates] = useState<string[]>([]);
  const [allCountries, setAllCountries] = useState<string[]>([]);

  const [keywordAcademicType, setKeywordAcademicType] = useState("");
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

  const getCategories = useCallback(async () => {
    if (allCategories?.length > 0) {
      setWantedAcademicTypes(
        allCategories?.filter(
          (item: CategoryProps) =>
            generateSlug(item?.parent_category) ===
            generateSlug("Academic Type"),
        ),
      );
    }
  }, [allCategories]);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const getAllPropertyDetails = useCallback(async () => {
    setLoading(true);

    try {
      const [propertyRes, locationRes, reviewRes, propertyScoreRes] =
        await Promise.allSettled([
          API.get(`/property`),
          API.get(`/locations`),
          API.get(`/review`),
          API.get(`/property/all/score`),
        ]);

      const propertiesData =
        propertyRes.status === "fulfilled"
          ? propertyRes.value.data.filter(
              (item: PropertyProps) => item.status === "Active",
            )
          : [];

      const locationsData =
        locationRes.status === "fulfilled" ? locationRes.value.data : [];
      const reviewsData =
        reviewRes.status === "fulfilled" ? reviewRes.value.data : [];
      const propertyScoreData =
        propertyScoreRes.status === "fulfilled"
          ? propertyScoreRes.value.data
          : [];

      const merged = propertiesData.map((property: PropertyProps) => {
        const location = locationsData.find(
          (loc: PropertyLocationProps) => loc.property_id === property._id,
        );

        const reviews = reviewsData.filter(
          (rev: PropertyReviewProps) => rev.property_id === property._id,
        );

        const pScore = propertyScoreData.find(
          (r: { property_id: string }) =>
            String(r.property_id) === property._id,
        );

        return {
          property_name: property.property_name,
          property_logo: property.property_logo,
          property_description: property.property_description,
          academic_type: getCategoryById(property.academic_type),
          property_city: location?.property_city,
          property_state: location?.property_state,
          property_country: location?.property_country,
          property_slug: property.property_slug,
          property_score: pScore?.property_score || 0,
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
            (a.property_score || 9999) - (b.property_score || 9999),
        ),
      );
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [getCategoryById]);

  useEffect(() => {
    getAllPropertyDetails();
  }, [getAllPropertyDetails]);

  const hasCategoryMatch = useMemo(() => {
    if (!keyword_slug) return false;

    const slug = keyword_slug.toLowerCase();

    const matched = wantedAcademicTypes
      .map((item) => ({
        name: item.category_name,
        slug: generateSlug(item.category_name),
      }))
      .filter((item) => item.slug.split("-").every((p) => slug.includes(p)))
      .sort((a, b) => b.slug.length - a.slug.length)[0];

    if (matched) {
      setKeywordAcademicType(matched.name);
      return true;
    }

    setKeywordAcademicType("");
    return false;
  }, [keyword_slug, wantedAcademicTypes]);

  useEffect(() => {
    if (!keyword_slug) return;

    const slug = keyword_slug.toLowerCase();

    if (!slug.includes("top") && !slug.includes("best")) {
      router.replace("/");
      return;
    }

    setIsInvalidSearch(false);
    setKeywordCity("");
    setKeywordState("");
    setKeywordCountry("");

    let tempCheckString = slug.replaceAll("-", " ");

    tempCheckString = tempCheckString
      .replace(/\b(top|best)\b/g, "")
      .replace(/\b\d+\b/g, "");

    if (keywordAcademicType) {
      const catSlug = generateSlug(keywordAcademicType).replaceAll("-", " ");
      tempCheckString = tempCheckString.replace(catSlug, "");
    }

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
    ].sort((a, b) => b.slug.length - a.slug.length);

    combinedLocations.forEach((loc) => {
      const regex = new RegExp(`\\b${loc.slug}\\b`);

      if (regex.test(tempCheckString)) {
        if (loc.type === "city") setKeywordCity(loc.val);
        if (loc.type === "state") setKeywordState(loc.val);
        if (loc.type === "country") setKeywordCountry(loc.val);

        tempCheckString = tempCheckString.replace(regex, "");
      }
    });

    tempCheckString = tempCheckString
      .replace(/\b(in)\b/g, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();

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
    keywordAcademicType,
    router,
  ]);

  const filteredProperties = properties
    .filter((property) => {
      if (isInvalidSearch) return false;
      if (!hasCategoryMatch) return false;

      const matchCategory =
        normalize(property.academic_type) === normalize(keywordAcademicType);
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
    safeCurrentPage * ITEMS_PER_PAGE,
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
          <GraduationCapIcon className="w-16 h-16 mx-auto mb-4" />
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
                key={index}
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
