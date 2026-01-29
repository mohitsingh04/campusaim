import { useCallback, useEffect, useState } from "react";
import API from "@/context/API";
import { CategoryProps, CourseProps } from "@/types/Types";
import {
	generateSlug,
	getErrorResponse,
	shuffleArray,
} from "@/context/Callbacks";
import { PropertyProps } from "@/types/PropertyTypes";

interface SeoProps {
	_id: string;
	course_id: string;
	slug: string;
}

interface UsePropertyMenuDataProps {
	category: CategoryProps[] | undefined;
	academicType?: string;
	basePath: string;
}

export function useCoursesMenuData() {
	const [courseMenuData, setCourseMenuData] = useState<any>(null);
	const [courseLoading, setCoursesLoading] = useState(true);

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				setCoursesLoading(true);

				// 1. Fetch all courses
				const courseRes = await API.get("/course");
				const courses: CourseProps[] = courseRes.data;

				// 2. Fetch SEO slugs for courses
				const seoRes = await API.get("/all/seo?type=course");
				const seoList: SeoProps[] = seoRes.data;

				// 3. Build menu links (ONLY if SEO slug exists)
				const links = courses
					.map((course) => {
						// Match SEO entry
						const matchedSeo = seoList.find(
							(seo) => seo.course_id === course._id,
						);

						// Skip if SEO slug not found
						if (!matchedSeo?.slug) return null;

						return {
							name: course.course_name, // name visible
							href: `/course/${matchedSeo.slug}`, // ONLY SEO SLUG
						};
					})
					.filter(Boolean) // remove nulls
					.slice(0, 30); // limit to top 30

				// 4. Build final menu structure
				const formattedMenu = {
					"Popular Courses": {
						main: {
							title: "Popular Courses",
							links,
							viewAll: "/courses",
						},
					},
				};

				setCourseMenuData(formattedMenu);
			} catch (err) {
				getErrorResponse(err, true);
			} finally {
				setCoursesLoading(false);
			}
		};

		fetchCourses();
	}, []);

	return { courseMenuData, courseLoading };
}

export function usePropertyMenuData({
	category,
	academicType,
	basePath,
}: UsePropertyMenuDataProps) {
	const [propertyMenuData, setPropertyMenuData] = useState<any>(null);
	const [propertyLoading, setPropertyLoading] = useState(true);

	const getCategoryById = useCallback(
		(_id: number | string) => {
			if (!category?.length) return null;
			return category.find((item) => item._id === _id)?.category_name || null;
		},
		[category],
	);

	useEffect(() => {
		if (!category?.length) return;

		const fetchProperties = async () => {
			try {
				setPropertyLoading(true);

				const res = await API.get("/property");

				const properties: PropertyProps[] = shuffleArray(res.data)
					.filter((p: any) => {
						if (!academicType) return true;

						const academicCategory = getCategoryById(p.academic_type);
						if (!academicCategory) return false;

						return generateSlug(academicCategory) === academicType;
					})
					.map((item: any) => {
						const categoryName = getCategoryById(item.academic_type);
						const propertyTypeName = getCategoryById(item.property_type);

						if (!categoryName || !propertyTypeName) return null;

						return {
							...item,
							category: categoryName,
							property_type: propertyTypeName,
						};
					})
					.filter(Boolean);

				const menuData: Record<string, any> = {};

				properties.forEach((p) => {
					if (!menuData[p.category]) {
						menuData[p.category] = {};
					}

					if (!menuData[p.category][p.property_type]) {
						menuData[p.category][p.property_type] = {
							title: p.property_type,
							links: [],
							viewAll: `${basePath}?category=${generateSlug(
								p.category,
							)}&property_type=${generateSlug(p.property_type)}`,
						};
					}

					menuData[p.category][p.property_type].links.push({
						name: p.property_name,
						href: `/${generateSlug(p.category)}/${p.property_slug}/overview`,
					});

					// limit items per section
					menuData[p.category][p.property_type].links = menuData[p.category][
						p.property_type
					].links.slice(0, 10);
				});

				setPropertyMenuData(menuData);
			} catch (error) {
				getErrorResponse(error, true);
			} finally {
				setPropertyLoading(false);
			}
		};

		fetchProperties();
	}, [category, academicType, basePath, getCategoryById]);

	return { propertyMenuData, propertyLoading };
}
