"use client";

import { useCallback, useEffect, useState } from "react";
import API from "@/context/API";
import { PropertyLocationProps, PropertyProps } from "@/types/PropertyTypes";
import {
	CategoryProps,
	CourseProps,
	EventProps,
	SeoProps,
} from "@/types/Types";
import { BlogCategoryProps, BlogsProps, BlogTagProps } from "@/types/BlogTypes";
import { NewsProps } from "@/types/NewsTypes";
import {
	getErrorResponse,
	getFieldDataSimple,
	isDateEnded,
} from "@/context/Callbacks";

export default function useSearchFetch() {
	const [properties, setProperties] = useState<PropertyProps[]>([]);
	const [courses, setCourses] = useState<CourseProps[]>([]);
	const [blogs, setBlogs] = useState<BlogsProps[]>([]);
	const [events, setEvents] = useState<EventProps[]>([]);
	const [news, setNews] = useState<NewsProps[]>([]);
	const [keywordsList, setKeywordList] = useState<string[]>([]);

	const [loading, setLoading] = useState(true);

	const getCategoryName =
		(categories: CategoryProps[]) => (id: string | number) => {
			const found = categories.find(
				(cat) =>
					String(cat._id) === String(id) || String(cat.uniqueId) === String(id),
			);
			return found?.category_name || id;
		};

	const fetchAll = useCallback(async () => {
		setLoading(true);

		try {
			const [
				propertyRes,
				locationRes,
				categoriesRes,
				courseRes,
				eventRes,
				newsRes,
				blogRes,
				blogCatRes,
				blogTagRes,
				seoRes,
			] = await Promise.all([
				API.get("/property"),
				API.get("/locations"),
				API.get("/category"),
				API.get("/course"),
				API.get("/events"),
				API.get("/news-and-updates"),
				API.get("/blog"),
				API.get("/blog/category/all"),
				API.get("/blog/tag/all"),
				API.get("/all/seo"),
			]);

			const categoryData = categoriesRes?.data || [];

			const seoData: SeoProps[] = seoRes?.data || [];
			const findCategory = getCategoryName(categoryData);

			const processedEvents = eventRes.data
				?.filter(
					(ev: EventProps) =>
						ev.status === "Active" &&
						isDateEnded(ev?.schedule?.[ev?.schedule?.length - 1]?.date),
				)
				.map((ev: EventProps) => {
					const event_slug = seoData.find((se) => se.event_id === ev._id)?.slug;
					if (!event_slug) return null;

					return {
						...ev,
						category: ev.category?.map((c) => findCategory(c)),
						event_slug,
					};
				})
				.filter(Boolean) as EventProps[];

			setEvents(processedEvents);

			const processedNews = newsRes.data
				?.filter((ne: NewsProps) => ne.status === "Published")
				.map((ne: NewsProps) => {
					const news_slug = seoData.find((se) => se.news_id === ne._id)?.slug;
					if (!news_slug) return null;
					return { ...ne, news_slug };
				})
				.filter(Boolean) as NewsProps[];

			setNews(processedNews);

			const processedCourses = courseRes.data
				?.filter((course: CourseProps) => course.status === "Active")
				.map((course: CourseProps) => {
					const course_slug = seoData.find(
						(se) => se.course_id === course._id,
					)?.slug;

					if (!course_slug) return null;

					return {
						...course,
						course_type: findCategory(course.course_type),
						course_level: findCategory(course.course_level),
						certification_type: findCategory(course.certification_type),
						course_slug,
					};
				})
				.filter(Boolean) as CourseProps[];

			setCourses(processedCourses);

			const processedProperties = propertyRes.data
				?.filter((property: PropertyProps) => property.status === "Active")
				.map((property: PropertyProps) => {
					const location = locationRes.data.find(
						(loc: PropertyLocationProps) => loc.property_id === property._id,
					);

					return {
						...property,
						...location,
						category: findCategory(property.category),
						property_type: findCategory(property.property_type),
					};
				}) as PropertyProps[];

			setProperties(processedProperties);

			const blogCategoryMap: Record<string | number, string> =
				Object.fromEntries(
					blogCatRes.data.map((c: BlogCategoryProps) => [
						c._id,
						c.blog_category,
					]),
				);

			const blogTagMap: Record<string | number, string> = Object.fromEntries(
				blogTagRes.data.map((t: BlogTagProps) => [t._id, t.blog_tag]),
			);

			const processedBlogs = blogRes.data
				?.filter((blog: BlogsProps) => blog.status === "Active")
				.map((blog: BlogsProps) => {
					const blog_slug = seoData.find((se) => se.blog_id === blog._id)?.slug;
					if (!blog_slug) return null;

					return {
						...blog,
						category: blog.category?.map((id) => blogCategoryMap[id] || id),
						tags: blog.tags?.map((id) => blogTagMap[id] || id),
						blog_slug,
					};
				})
				.filter(Boolean) as BlogsProps[];

			setBlogs(processedBlogs);
		} catch (error) {
			getErrorResponse(error, true);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAll();
	}, [fetchAll]);

	const getKeywordList = useCallback(async () => {
		if (!properties || properties.length === 0) return;

		try {
			const types = ["top", "best"];
			const numbers = [3, 5, 10, 20, 50, 100];

			const catList: string[] = await getFieldDataSimple(
				properties,
				"category",
			);

			const baseKeywords: string[] = catList.flatMap((cat) =>
				types.flatMap((type) => [
					`${type} ${cat}`,
					...numbers.map((num) => `${type} ${num} ${cat}`),
				]),
			);

			const locationKeywords: string[] = [];

			for (const cat of catList) {
				const relatedProperties = properties.filter(
					(property) => property?.category === cat,
				);

				if (relatedProperties.length === 0) continue;

				const cities = await getFieldDataSimple(
					relatedProperties,
					"property_city",
				);
				const states = await getFieldDataSimple(
					relatedProperties,
					"property_state",
				);
				const countries = await getFieldDataSimple(
					relatedProperties,
					"property_country",
				);

				const locations = [
					...(cities || []),
					...(states || []),
					...(countries || []),
				].filter(Boolean);

				for (const type of types) {
					for (const location of locations) {
						locationKeywords.push(`${type} ${cat} in ${location}`);

						for (const num of numbers) {
							locationKeywords.push(`${type} ${num} ${cat} in ${location}`);
						}
					}
				}
			}

			const finalList = [...baseKeywords, ...locationKeywords];

			setKeywordList(finalList);
		} catch (error) {
			getErrorResponse(error, true);
		}
	}, [properties]);

	useEffect(() => {
		getKeywordList();
	}, [getKeywordList]);

	return {
		properties,
		courses,
		blogs,
		events,
		news,
		keywordsList,
		loading,
	};
}
