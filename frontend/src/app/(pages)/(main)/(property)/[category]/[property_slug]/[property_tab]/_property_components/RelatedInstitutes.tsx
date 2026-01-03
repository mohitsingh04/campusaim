"use client";
import API from "@/contexts/API";
import { generateSlug } from "@/contexts/Callbacks";
import { CategoryProps, LocationProps, PropertyProps } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

const RelatedInstitutes = ({
	category,
	mainProperty,
}: {
	category: CategoryProps[];
	mainProperty: PropertyProps;
}) => {
	const [properties, setProperties] = useState<PropertyProps[]>([]);
	const [loading, setLoading] = useState(true);

	const getCategoryById = useCallback(
		(id: string) => {
			const cat = category?.find((item) => item._id === id);
			return cat?.category_name;
		},
		[category]
	);

	const getProperties = useCallback(async () => {
		if (!mainProperty) return;

		try {
			setLoading(true);

			const [propertyRes, locationRes] = await Promise.all([
				API.get(`/property`),
				API.get(`/locations`),
			]);

			const allProperties: PropertyProps[] = propertyRes.data;
			const allLocations: LocationProps[] = locationRes.data;

			const merged = allProperties.map((property) => {
				const locationMatch = allLocations.find(
					(loc) => loc.property_id === property._id
				);

				return {
					...property,
					category: getCategoryById(property?.academic_type) || "Unknown",
					property_type: getCategoryById(property?.property_type) || "Unknown",
					city: locationMatch?.property_city || "Unknown",
					state: locationMatch?.property_state || "Unknown",
					country: locationMatch?.property_country || "Unknown",
				};
			});

			let selected: PropertyProps[] = [];
			const selectedIds = new Set<number | string>();

			const addProperties = (filterFn: (p: PropertyProps) => boolean) => {
				if (selected.length >= 4) return;
				const needed = 4 - selected.length;

				const filtered = merged
					.filter(
						(p) =>
							filterFn(p) &&
							p.uniqueId !== mainProperty.uniqueId &&
							!selectedIds.has(p.uniqueId)
					)
					.sort(() => 0.5 - Math.random())
					.slice(0, needed);

				filtered.forEach((p) => selectedIds.add(p.uniqueId));
				selected = [...selected, ...filtered];
			};

			addProperties((p) => p.city === mainProperty.property_city);
			addProperties((p) => p.category === mainProperty.category);
			addProperties((p) => p.state === mainProperty.property_state);
			addProperties((p) => p.property_type === mainProperty.property_type);
			addProperties((p) => p.country === mainProperty.property_country);

			if (selected.length < 4) {
				const needed = 4 - selected.length;
				const randomFill = merged
					.filter(
						(p) =>
							p.uniqueId !== mainProperty.uniqueId &&
							!selectedIds.has(p.uniqueId)
					)
					.sort(() => 0.5 - Math.random())
					.slice(0, needed);
				selected = [...selected, ...randomFill];
			}

			setProperties(selected);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [getCategoryById, mainProperty]);

	useEffect(() => {
		getProperties();
	}, [getProperties]);

	return (
		<div className="mt-4 bg-white rounded-xl shadow-sm">
			<div className="border-b border-gray-300 text-xl font-semibold text-black mb-4 p-4">
				<h2>Related Institutes</h2>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 pt-0">
				{loading
					? Array.from({ length: 4 }).map((_, idx) => (
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
									href={`/${generateSlug(institute.category)}/${
										institute?.property_slug
									}/overview`}
									className="mr-4"
								>
									<div className="relative w-14 h-14 rounded-md shadow-sm overflow-hidden">
										<Image
											src={
												institute?.property_logo?.[0]
													? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${institute?.property_logo?.[0]}`
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
										href={`/${generateSlug(institute.category)}/${
											institute?.property_slug
										}/overview`}
										className="text-lg font-semibold text-black hover:text-gray-700 transition"
									>
										{institute.property_name}
									</Link>
									<p className="text-sm text-gray-500">
										{[institute.city, institute.state, institute.country]
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
