"use client";
import { useCallback, useEffect, useState } from "react";
import BrowseByLocation from "./_main_components/BrowseByLocation";
import Category from "./_main_components/Category";
import FeaturedBlogs from "./_main_components/FeaturedBlogs";
import FeaturedCourses from "./_main_components/FeaturedCourses";
import FeaturedFaq from "./_main_components/FeaturedFaqs";
import FeaturedProperty from "./_main_components/FeaturedProperty";
import Hero from "./_main_components/Hero";

import API from "@/contexts/API";
import {
	CategoryProps,
	CourseProps,
	LocationProps,
	PropertyProps,
	RankProps,
	ReviewProps,
	SimpleLocationProps,
} from "@/types/types";
import SearchModal from "@/components/searchModal/SearchModal";
import HomeLoading from "@/components/Loader/Home/HomeLoading";

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
				API.get("/property-course"),
				API.get("/review"),
				API.get("/category"),
			]);

			// Helper to extract value safely
			const getData = (index: number) =>
				results[index].status === "fulfilled" ? results[index].value?.data : [];

			const rankRes = getData(0);
			const propertyRes = getData(1);
			const locationRes = getData(2);
			const courseRes = getData(3);
			const reviewRes = getData(4);
			const catRes = getData(5);

			setCategories(catRes);

			// Compute unique locations only once
			const uniqueLocations = [
				...new Set(
					(locationRes || [])
						.map((loc: LocationProps) =>
							JSON.stringify({
								city: loc.property_city?.trim(),
								state: loc.property_state?.trim(),
								country: loc.property_country?.trim(),
							})
						)
						.filter(Boolean)
				),
			].map((item) => JSON.parse(item as string) as SimpleLocationProps);

			setUnqieLocations(uniqueLocations);

			const activeProperties = (propertyRes || []).filter(
				(property: PropertyProps) => property.status?.toLowerCase() === "active"
			);

			const merged = activeProperties.map((propertyItem: PropertyProps) => {
				const matchingRank = (rankRes || []).find(
					(rankItem: RankProps) => rankItem.property_id === propertyItem._id
				);

				const matchingLocation = (locationRes || []).find(
					(locationItem: LocationProps) =>
						locationItem.property_id === propertyItem._id
				);

				const matchingReviews = (reviewRes || []).filter(
					(reviewItem: ReviewProps) =>
						reviewItem.property_id === propertyItem._id
				);

				const matchingCourse = (courseRes || []).filter(
					(courseItem: CourseProps) =>
						courseItem.property_id === propertyItem._id
				);

				return {
					...propertyItem,
					rank: matchingRank?.rank || null,
					lastRank: matchingRank?.lastRank || null,
					overallScore: matchingRank?.overallScore || null,
					...(matchingLocation || {}),
					reviews: matchingReviews,
					course: { courses: matchingCourse },
				};
			});

			setProperties(merged);
		} catch (error) {
			console.error("❌ Error fetching data:", error);
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
			console.log(response?.data?.message);
		} catch (error) {
			console.log(error);
		}
	}, []);

	useEffect(() => {
		getPropertySlugGenerater();
	}, [getPropertySlugGenerater]);
	return (
		<>
			{!loading ? (
				<>
					<SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
					<Hero modalOpen={() => setIsOpen(true)} />
					<Category />
					<FeaturedProperty properties={properties} categorise={categories} />
					<FeaturedCourses />
					<BrowseByLocation
						unqieLocations={unqieLocations}
						properties={properties}
					/>
					<FeaturedBlogs />
					<FeaturedFaq />
				</>
			) : (
				// <HomeLoading />
				<p>Loading...</p>
			)}
		</>
	);
}
