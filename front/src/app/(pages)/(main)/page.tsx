"use client";
import API from "@/context/API";
import { getErrorResponse, getSuccessResponse } from "@/context/Callbacks";
import {
  PropertyLocationProps,
  PropertyProps,
  PropertyRankProps,
} from "@/types/PropertyTypes";
import { CategoryProps, SimpleLocationProps } from "@/types/Types";
import { useCallback, useEffect, useState } from "react";
import BrowseByLocation from "./_home_component/BrowseByLocation";
import CategorySection from "./_home_component/CategorySection";
import SearchModal from "@/components/search_modal/SearchModal";
import { Hero } from "./_home_component/Hero";
import Testimonials from "./_home_component/Testimonials";
import FaqsSection from "./_home_component/FaqsSection";
import PropertyCarousel from "./_home_component/Properties";
import PopularCourses from "./_home_component/FeaturedCourses";
import Landing from "@/ui/loader/page/landing/landing";

export default function Home() {
  const [properties, setProperties] = useState<PropertyProps[]>([]);
  const [unqieLocations, setUnqieLocations] = useState<SimpleLocationProps[]>(
    []
  );
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [loading, setLoading] = useState(true);

  const getRanksAndProperty = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        API.get("/ranks"),
        API.get("/property"),
        API.get("/locations"),
        API.get("/category"),
      ]);

      // Helper to extract value safely
      const getData = (index: number) =>
        results[index].status === "fulfilled" ? results[index].value?.data : [];

      const rankRes = getData(0);
      const propertyRes = getData(1);
      const locationRes = getData(2);
      const catRes = getData(3);

      setCategories(catRes);

      // Compute unique locations only once
      const uniqueLocations = [
        ...new Set(
          (locationRes || [])
            .map((loc: PropertyLocationProps) =>
              JSON.stringify({
                city: loc.property_city?.trim(),
                state: loc.property_state?.trim(),
                country: loc.property_country?.trim(),
              })
            )
            .filter(Boolean)
        ),
      ].map((item) => JSON.parse(item as string) as SimpleLocationProps);

      const getCategoryById = (id: string) => {
        const cat = catRes.find(
          (c: CategoryProps) => Number(c.uniqueId) === Number(id)
        );
        return cat?.category_name || "Unknown Category";
      };

      setUnqieLocations(uniqueLocations);

      const activeProperties = (propertyRes || []).filter(
        (property: PropertyProps) => property.status?.toLowerCase() === "active"
      );

      const merged = activeProperties.map((propertyItem: PropertyProps) => {
        const matchingRank = (rankRes || []).find(
          (rankItem: PropertyRankProps) =>
            rankItem.property_id === propertyItem._id
        );

        const matchingLocation = (locationRes || []).find(
          (locationItem: SimpleLocationProps) =>
            Number(locationItem.property_id) === propertyItem.uniqueId
        );

        return {
          ...propertyItem,
          category: getCategoryById(propertyItem?.category),
          rank: matchingRank?.rank || null,
          lastRank: matchingRank?.lastRank || null,
          overallScore: matchingRank?.overallScore || null,
          ...(matchingLocation || {}),
        };
      });

      merged.sort((a: PropertyProps, b: PropertyProps) => {
        if (!a.rank && !b.rank) return 0;
        if (!a.rank) return 1;
        if (!b.rank) return -1;
        return Number(a.rank) - Number(b.rank);
      });

      setProperties(merged);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getRanksAndProperty();
  }, [getRanksAndProperty]);

  const getPropertySlugGenerater = useCallback(async () => {
    try {
      const response = await API.patch("/property/slug/generate");
      getSuccessResponse(response, true);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getPropertySlugGenerater();
  }, [getPropertySlugGenerater]);

  if (loading) return <Landing />;
  return (
    <div>
      <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <Hero modalOpen={() => setIsOpen(true)} />
      <CategorySection properties={properties} />
      <PropertyCarousel properties={properties} />
      <PopularCourses categories={categories} />
      <BrowseByLocation
        unqieLocations={unqieLocations}
        properties={properties}
      />
      <Testimonials />
      <FaqsSection />
    </div>
  );
}
