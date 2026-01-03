"use client";
import API from "@/contexts/API";
import { generateSlug } from "@/contexts/Callbacks";
import { CategoryProps, CourseProps, PropertyProps } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

const RelatedInstitutes = ({
	category,
	course,
}: {
	category: CategoryProps[];
	course: CourseProps | null;
}) => {
	const [properties, setProperties] = useState<PropertyProps[]>([]);
	const [loading, setLoading] = useState(true);

	const getCategoryById = useCallback(
		(id: string) => {
			const cat = category?.find((item) => item._id === id);
			return cat?.category_name || "Unknown";
		},
		[category]
	);

	const getProperties = useCallback(async () => {
		if (!course?._id) return;

		try {
			setLoading(true);

			const response = await API.get(
				`/related/property/course/${course._id}?limit=20`
			);

			const maindata = response?.data?.properties ?? [];

			// ✅ Make sure it's always an array
			const finalData = Array.isArray(maindata)
				? maindata.map((prop: PropertyProps) => ({
						...prop,
						category: getCategoryById(prop.category),
				  }))
				: [];

			setProperties(finalData);
		} catch (error) {
			console.error("Error fetching properties:", error);
			setProperties([]); // fallback to empty array
		} finally {
			setLoading(false);
		}
	}, [course?._id, getCategoryById]);

	useEffect(() => {
		getProperties();
	}, [getProperties]);

	if (properties?.length <= 0) return;

	return (
		<div className="mt-4 bg-white rounded-xl shadow-sm">
			<div className="flex items-center justify-between border-b border-gray-300 text-xl font-semibold text-black mb-4 p-4">
				<h2>Related Institutes</h2>
				<Link
					className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200"
					href={`/yoga-institutes?course_name=${generateSlug(
						course?.course_name || ""
					)}`}
				>
					View All Institutes
				</Link>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 pt-0">
				{loading
					? Array.from({ length: 6 }).map((_, idx) => (
							<div
								key={idx}
								className="flex items-center p-4 bg-white rounded-lg shadow-sm"
							>
								<Skeleton width={56} height={56} className="rounded-md mr-4" />
								<div className="flex flex-col gap-2">
									<Skeleton width={120} height={16} />
									<Skeleton width={80} height={14} />
								</div>
							</div>
					  ))
					: properties.map((institute) => (
							<div
								key={institute.uniqueId}
								className="flex items-center p-4 bg-white rounded-lg shadow-xs hover:shadow-sm hover:bg-gray-50 transition duration-200"
							>
								<Link
									href={`/${generateSlug(institute?.category)}/${
										institute?.property_slug
									}/overview`}
									className="mr-4"
								>
									<div className="relative w-14 h-14 rounded-md shadow-sm overflow-hidden">
										<Image
											src={
												institute?.property_logo?.[0]
													? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${institute.property_logo[0]}`
													: "/img/default-images/campusaim-logo.png"
											}
											alt={institute.property_name}
											fill
											className="object-cover"
										/>
									</div>
								</Link>
								<div>
									<Link
										href={`/${generateSlug(institute?.category)}/${
											institute?.property_slug
										}/overview`}
										className="text-lg font-semibold text-black hover:text-gray-700 transition"
									>
										{institute.property_name}
									</Link>
									<p className="text-sm text-gray-500">
										{[
											institute.property_city,
											institute.property_state,
											institute.property_country,
										]
											.filter(Boolean)
											.join(", ")}
									</p>
								</div>
							</div>
					  ))}
			</div>
		</div>
	);
};

export default RelatedInstitutes;
