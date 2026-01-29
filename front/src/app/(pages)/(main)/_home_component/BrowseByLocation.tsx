"use client";

import React, { useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { SimpleLocationProps } from "@/types/Types";
import { PropertyProps } from "@/types/PropertyTypes";
import { BiChevronLeft, BiChevronRight, BiMapPin } from "react-icons/bi";
import { BsArrowUpRight } from "react-icons/bs";
import { LuBuilding2 } from "react-icons/lu";
import { HeadingProps } from "@/ui/headings/MainHeading";
import Link from "next/link";
import { generateSlug } from "@/context/Callbacks";
import CountUp from "react-countup";
import Image from "next/image";

export default function BrowseByLocation({
	unqieLocations,
	properties,
}: {
	unqieLocations: SimpleLocationProps[];
	properties: PropertyProps[];
}) {
	const swiperRef = useRef<SwiperType | null>(null);

	const locationsImages = [
		"/img/browse-by-locations/rishikesh.webp",
		"/img/browse-by-locations/dehradun.webp",
		"/img/browse-by-locations/bengalore.webp",
		"/img/browse-by-locations/mysuru.webp",
		"/img/browse-by-locations/chennai.webp",
		"/img/browse-by-locations/dharamsala.webp",
		"/img/browse-by-locations/varkala.webp",
		"/img/browse-by-locations/south-goa.webp",
		"/img/browse-by-locations/new-delhi.webp",
		"/img/browse-by-locations/varanshi.webp",
	];

	const propertyCountMap = properties.reduce<Record<string, number>>(
		(acc, property) => {
			const city = property.property_city;
			if (city) {
				acc[city] = (acc[city] || 0) + 1;
			}
			return acc;
		},
		{},
	);

	const locationsWithCount = unqieLocations.map((loc) => ({
		...loc,
		count: propertyCountMap[loc?.city || ""] || 0,
	}));
	const topLocations = locationsWithCount
		.sort((a, b) => b.count - a.count)
		.slice(0, 10);

	if (topLocations?.length <= 0) return;

	return (
		<section className="relative py-6 md:py-14 sm:px-8 p-2 bg-(--primary-bg)  overflow-hidden">
			<div className="relative z-10 ">
				<div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-6">
					<HeadingProps
						tag="Find Verified Universities"
						title=" Browse by "
						activetitle="Location"
						subtitle="Discover high-quality studios and retreats in India's most inspiring locations."
					/>

					<div className="hidden sm:flex items-center">
						<button
							onClick={() => swiperRef.current?.slidePrev()}
							className="w-10 h-10 flex items-center justify-center rounded-s-md border border-(--border) bg-(--secondary-bg) text-(--text-color-emphasis) shadow-custom hover:bg-(--main) hover:text-(--white) transition-all duration-300"
						>
							<BiChevronLeft size={22} />
						</button>
						<button
							onClick={() => swiperRef.current?.slideNext()}
							className="w-10 h-10 flex items-center justify-center rounded-e-md border border-(--border) bg-(--secondary-bg) text-(--text-color-emphasis) shadow-custom hover:bg-(--main) hover:text-(--white)  transition-all duration-300"
						>
							<BiChevronRight size={22} />
						</button>
					</div>
				</div>

				<div className="relative">
					<Swiper
						modules={[Navigation, Autoplay]}
						onBeforeInit={(swiper) => {
							swiperRef.current = swiper;
						}}
						spaceBetween={24}
						loop={true}
						autoplay={{
							delay: 3500,
							disableOnInteraction: false,
							pauseOnMouseEnter: true,
						}}
						breakpoints={{
							0: {
								slidesPerView: 2,
							},
							640: {
								slidesPerView: 3,
							},
							1280: {
								slidesPerView: 6,
							},
						}}
						className="pb-12"
					>
						{topLocations.map((location, index) => (
							<SwiperSlide key={index} className="h-auto">
								<Link
									href={`/universities?country=${generateSlug(
										location.country || "",
									)}&state=${generateSlug(
										location.state || "",
									)}&city=${generateSlug(location.city || "")}`}
								>
									<div className="group relative h-full shrink-0 rounded-custom  overflow-hidden cursor-pointer">
										<div className="relative aspect-3/4 sm:aspect-4/5 overflow-hidden">
											<Image
												src={locationsImages[index] || locationsImages[0]}
												alt={location?.city || "City"}
												fill
												className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
											/>

											<div className="absolute inset-0 bg-linear-to-t from-(--main) via-black/90 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 scale-110" />

											<div className="absolute top-4 right-4 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
												<div className="bg-(--white)/20 backdrop-blur-md p-2 rounded-full text-(--white) hover:rotate-45 transition-transform duration-300">
													<BsArrowUpRight size={20} />
												</div>
											</div>

											<div className="absolute inset-x-0 bottom-0 p-5 text-left transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 text-shadow text-(--white)">
												<h3 className="font-bold text-lg lg:text-xl drop-shadow-sm truncate">
													{location.city}
												</h3>

												<div className="flex items-center gap-1.5 text-sm my-1">
													<BiMapPin className="w-3.5 h-3.5 " />
													<span className="font-medium truncate">
														{location.state}
													</span>
												</div>

												<div className="inline-flex items-center gap-2 text-xs font-medium">
													<LuBuilding2 className="h-3.5 w-3.5 " />
													<span>
														<CountUp end={location.count} /> Institute
													</span>
												</div>
											</div>
										</div>

										<div className="absolute inset-0 z-20 bg-linear-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1500 ease-in-out" />
									</div>
								</Link>
							</SwiperSlide>
						))}
					</Swiper>
				</div>
			</div>
		</section>
	);
}
