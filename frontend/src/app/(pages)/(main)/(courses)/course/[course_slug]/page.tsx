"use client";
import API from "@/contexts/API";
import { CategoryProps, CourseProps } from "@/types/types";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { LuCircleCheck } from "react-icons/lu";
import RelatedCourses from "../_course_components/RelatedCourses";
import Breadcrumb from "@/components/breadcrumbs/breadcrumbs";
import Loader from "@/components/Loader/Loader";
import CourseDetailCard from "../_course_components/CourseCard";
import CourseEnquiryForm from "../_course_components/CourseEnquiryForm";
import ReadMoreLess from "@/components/read-more/ReadMoreLess";
import RelatedInstitutes from "../_course_components/RelatedInstitutes";

export default function Course() {
	const { course_slug } = useParams();
	const [courses, setCourses] = useState<CourseProps[]>([]);
	const [mainCourse, setMainCourse] = useState<CourseProps | null>(null);
	const [loading, setLoading] = useState(true);
	const [category, setCategory] = useState<CategoryProps[]>([]);

	const getCourses = useCallback(async () => {
		setLoading(true);
		try {
			const results = await Promise.allSettled([
				API.get<CourseProps[]>(`/course`),
				API.get<CategoryProps[]>(`/category`),
			]);

			const [coursesRes, categoryRes] = results;

			if (coursesRes.status !== "fulfilled") {
				console.error("Failed to fetch courses:", coursesRes.reason);
				return;
			}

			const coursesData = coursesRes.value.data;
			const categoryData =
				categoryRes.status === "fulfilled" ? categoryRes.value.data : [];
			setCategory(categoryData);

			const categoryMap = new Map<string, string>();
			categoryData.forEach((cat) => {
				categoryMap.set(cat._id, cat.category_name);
			});

			const populatedCourses: CourseProps[] = coursesData.map((item) => {
				return {
					...item,
					course_type: categoryMap.get(item.course_type) ?? item.course_type,
				};
			});

			const filteredCourses = populatedCourses.filter(
				(item) => item.course_slug !== course_slug
			);

			const shuffledCourses = filteredCourses.sort(() => Math.random() - 0.5);

			const randomSixCourses = shuffledCourses.slice(0, 6);

			setCourses(randomSixCourses);

			setMainCourse(
				populatedCourses.find((item) => item.course_slug === course_slug) ??
					null
			);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [course_slug]);

	useEffect(() => {
		getCourses();
	}, [getCourses]);

	const getCategoryByObjectId = useCallback(
		(id: string) => {
			const cat = category?.find((item) => item._id === id);
			return cat?.category_name || "Unknown";
		},
		[category]
	);

	const getCategoryById = (id: string) => {
		const cat = category.find((c: any) => c._id === id)?.category_name;
		return cat || id;
	};

	const getCategoryNamesFromBestFor = (bestFor: any) => {
		if (!bestFor) return [];
		if (
			Array.isArray(bestFor) &&
			bestFor.length > 0 &&
			typeof bestFor[0] === "object"
		) {
			return bestFor
				.map((b: any) => b.category_name || b.name || b._id)
				.filter(Boolean);
		}
		if (Array.isArray(bestFor)) {
			return bestFor.map((id: string) => getCategoryById(id));
		}
		if (typeof bestFor === "string") {
			return [getCategoryById(bestFor)];
		}
		return [];
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<div className="min-h-screen bg-purple-50 text-gray-800">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
				<Breadcrumb
					items={[
						{ label: "Courses" },
						{ label: mainCourse?.course_name || "Course Name" },
					]}
				/>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 py-3">
					<div className="lg:col-span-1">
						<div className="sticky top-20">
							<CourseDetailCard
								getCategoryById={getCategoryById}
								course={mainCourse}
							/>
							{(mainCourse?.best_for?.length || 0) > 0 && (
								<div className="bg-white shadow-sm rounded-2xl my-2">
									<div className="p-6">
										<h4 className="font-semibold mb-4 text-gray-800">
											Perfect For
										</h4>
										<div className="space-y-3 text-sm">
											{mainCourse?.best_for?.map((item, index) => (
												<div
													className="flex items-center space-x-3"
													key={index}
												>
													<LuCircleCheck className="w-4 h-4 text-purple-500" />
													<span>{getCategoryNamesFromBestFor(item)}</span>
												</div>
											))}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					<div className="lg:col-span-2 space-y-0">
						<div className="max-w-6xl mx-auto">
							<div className="bg-white sm:rounded-2xl sm:shadow-sm  overflow-hidden">
								<div className="space-y-6 p-6">
									{mainCourse?.description && (
										<div>
											<h2 className="text-xl uppercase font-bold text-gray-600 mb-3">
												About {mainCourse?.course_name || "Institute"} (
												{mainCourse?.course_short_name})
											</h2>
											<ReadMoreLess htmlText={mainCourse?.description} />
										</div>
									)}
									{mainCourse?.course_eligibility && (
										<div>
											<h2 className="text-xl uppercase font-bold text-gray-600 mb-3">
												Eligibility of {mainCourse?.course_short_name}
											</h2>
											<ReadMoreLess htmlText={mainCourse?.course_eligibility} />
										</div>
									)}
								</div>
							</div>

							{/* Course Highlights Card */}

							<div className="bg-white shadow-sm rounded-2xl my-2 p-4">
								<RelatedCourses
									relatedCourses={courses}
									getCategoryByObjectId={getCategoryByObjectId}
								/>
							</div>
						</div>
						<CourseEnquiryForm course={mainCourse} />
						<RelatedInstitutes course={mainCourse} category={category} />
					</div>
				</div>
			</div>
		</div>
	);
}
