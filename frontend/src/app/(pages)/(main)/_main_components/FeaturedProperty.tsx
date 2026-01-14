"use client";
import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import { LuArrowLeft, LuArrowRight, LuMapPin } from "react-icons/lu";
import { cardVariants } from "@/contexts/varients";
import { FaStar } from "react-icons/fa";
import { CategoryProps, PropertyProps } from "@/types/types";
import Link from "next/link";
import { generateSlug, getAverageRating } from "@/contexts/Callbacks";
import Image from "next/image";

const FeaturedProperty = ({
	properties,
	categorise,
}: {
	properties: PropertyProps[];
	categorise: CategoryProps[];
}) => {
	const swiperRef = useRef<SwiperType | null>(null);

	const rankedProperties = properties
		.filter((item) => typeof item.rank === "number")
		.sort((a, b) => a.rank - b.rank)
		.slice(0, 10);

	const getCategoryById = (id: string) => {
		const cat = categorise?.find((item) => item._id === id);
		return cat?.category_name;
	};

	if (!properties || properties?.length <= 0) return;
	return (
		<section className="py-16 px-4 sm:px-8 md:px-16">
			{/* Heading */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				viewport={{ once: true }}
				className="max-w-7xl mx-auto mb-10 text-center"
			>
				<h2 className="text-3xl sm:text-4xl font-bold mb-3">
					Featured{" "}
					<span className="text-purple-600">Colleges & Universities</span>
				</h2>
				<p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
					Explore our carefully selected list of colleges and universities from
					across the country.
				</p>
			</motion.div>

			{/* Carousel */}
			<div className="relative max-w-7xl mx-auto">
				{/* Buttons */}
				<button
					onClick={() => swiperRef.current?.slidePrev()}
					className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full cursor-pointer shadow hover:bg-gray-100"
				>
					<LuArrowLeft size={18} />
				</button>
				<button
					onClick={() => swiperRef.current?.slideNext()}
					className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full cursor-pointer shadow hover:bg-gray-100"
				>
					<LuArrowRight size={18} />
				</button>

				<Swiper
					modules={[Navigation, Autoplay]}
					onSwiper={(swiper) => (swiperRef.current = swiper)}
					autoplay={{
						delay: 4000,
						disableOnInteraction: false,
						pauseOnMouseEnter: true,
					}}
					loop={true}
					allowTouchMove={true}
					spaceBetween={30}
					touchRatio={1}
					breakpoints={{
						0: { slidesPerView: 1 },
						640: { slidesPerView: 2 },
						1024: { slidesPerView: 3 },
					}}
				>
					{rankedProperties?.map((inst, index) => (
						<SwiperSlide key={index} className="py-4">
							<motion.div
								variants={cardVariants}
								initial="hidden"
								whileInView="visible"
								viewport={{ once: true }}
								whileHover={{ scale: 1.02 }}
								className="bg-white rounded-xl overflow-hidden shadow group transition-all duration-300"
							>
								<div className="relative">
									<Link
										href={`${process.env.NEXT_PUBLIC_BASE_URL}/${generateSlug(
											getCategoryById(inst?.academic_type) || ""
										)}/${inst?.property_slug}`}
										className="group"
									>
										<div className="relative w-full h-56 overflow-hidden">
											<Image
												src={
													inst?.featured_image?.[0]
														? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${inst?.featured_image?.[0]}`
														: "/img/default-images/campusaim-featured.png"
												}
												alt={inst.property_name}
												fill
												className="object-cover transition-transform duration-500 group-hover:scale-105"
											/>
										</div>
									</Link>
									<span className="absolute bottom-2 left-2 bg-purple-600 text-white text-sm font-semibold px-3 py-1 rounded">
										{getCategoryById(inst.category)}
									</span>
									<div className="absolute top-2 right-2 bg-purple-600 text-white text-center rounded px-2 py-1 text-xs font-bold">
										<div className="flex gap-1 items-center">
											<FaStar />
											{getAverageRating(inst?.reviews)} / 5
										</div>
									</div>
								</div>

								<div className="p-5">
									<div className="flex gap-4 text-gray-500 text-sm mb-2">
										{inst?.property_city && (
											<span className="flex items-center gap-1">
												<LuMapPin /> {inst.property_city}
											</span>
										)}
									</div>

									<Link
										href={`${process.env.NEXT_PUBLIC_BASE_URL}/${generateSlug(
											getCategoryById(inst?.academic_type) || ""
										)}/${inst?.property_slug}`}
									>
										<h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-700 mb-2">
											{inst.property_name}
										</h3>
									</Link>
									<Link
										href={`${process.env.NEXT_PUBLIC_BASE_URL}/${generateSlug(
											getCategoryById(inst?.academic_type) || ""
										)}/${inst?.property_slug}`}
										className="text-purple-600 font-medium text-sm inline-flex items-center gap-1 hover:underline"
									>
										Read More
										<LuArrowRight className="ml-1" />
									</Link>
								</div>
							</motion.div>
						</SwiperSlide>
					))}
				</Swiper>
			</div>

			{/* Footer Link */}
			<div className="text-center mt-10">
				<Link
					href="/colleges"
					className="text-purple-600 text-sm font-medium hover:underline inline-flex items-center"
				>
					View all Colleges & Universities &nbsp;→
				</Link>
			</div>
		</section>
	);
};

export default FeaturedProperty;
