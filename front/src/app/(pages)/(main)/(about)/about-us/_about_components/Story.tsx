"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BadgeBorder from "@/ui/badge/BadgeBorder";

const timelineData = [
	{
		year: 2020,
		title: "The Digital Foundation",
		description:
			"As education rapidly shifted online, we laid the groundwork for a digital-first platform. What began as a response to change became an opportunity to rethink access, reach, and how students discover quality education.",
	},
	{
		year: 2021,
		title: "Expanding Academic Scope",
		description:
			"With growing demand for clarity and guidance, we broadened our focus to include accredited colleges, universities, and diverse academic programs—moving beyond listings to meaningful educational discovery.",
	},
	{
		year: 2022,
		title: "Building Trust & Structure",
		description:
			"We strengthened partnerships with verified institutions and introduced structured data, ensuring students could rely on accurate information, transparent pathways, and credible academic options.",
	},
	{
		year: 2023,
		title: "Student-Centric Growth",
		description:
			"Listening closely to student needs, we enhanced search, filtering, and guidance tools—making it easier to compare institutions, courses, and opportunities aligned with personal goals.",
	},
	{
		year: 2024,
		title: "Beyond Listings",
		description:
			"The platform evolved into a comprehensive education ecosystem, integrating insights, resources, and decision-support tools to help students navigate admissions, programs, and career outcomes.",
	},
	{
		year: 2025,
		title: "Empowering the Future",
		description:
			"Looking ahead, our mission is to empower learners at scale—connecting students with trusted institutions, enabling informed choices, and supporting lifelong academic and professional growth.",
	},
];

export default function YogaTimeline() {
	const [activeIndex, setActiveIndex] = useState(0);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollContainerRef.current) {
			const activeElement = scrollContainerRef.current.children[
				activeIndex
			] as HTMLElement;
			if (activeElement) {
				const containerWidth = scrollContainerRef.current.offsetWidth;
				const itemWidth = activeElement.offsetWidth;
				const itemLeft = activeElement.offsetLeft;

				scrollContainerRef.current.scrollTo({
					left: itemLeft - containerWidth / 2 + itemWidth / 2,
					behavior: "smooth",
				});
			}
		}
	}, [activeIndex]);

	return (
		<section className="relative py-14 px-4 sm:px-8 bg-(--primary-bg) overflow-hidden">
			<div className="w-full flex flex-col gap-8">
				<div className="flex flex-col items-start text-start space-y-5">
					<BadgeBorder label="Our Journey" />
					<div className="relative">
						<h2 className="heading-lg mb-4 text-(--text-color-emphasis) font-semibold">
							Resilience & Rebirth: 2020-2025
						</h2>
						<p className="max-w-xl pt-2 text-(--text-color)">
							A story of navigating change, deepening our roots, and expanding
							our definition of what it means to live a life of yoga in modern
							times.
						</p>
					</div>
				</div>

				<div className="relative w-full">
					<div className="absolute top-[38px] left-0 w-full h-0.5 bg-(--border) rounded-full" />

					<div
						className="absolute top-[38px] left-0 h-0.5 bg-(--main) rounded-full transition-all duration-500"
						style={{
							width: `${(activeIndex / (timelineData.length - 1)) * 100}%`,
						}}
					/>

					<div
						ref={scrollContainerRef}
						className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide items-start py-6"
						style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
					>
						{timelineData.map((item, index) => {
							const isActive = index === activeIndex;

							return (
								<button
									key={item.year}
									onClick={() => setActiveIndex(index)}
									// Adjusted width for fewer items to look good on desktop
									className="shrink-0 w-1/3 md:w-1/4 snap-center flex flex-col items-center gap-3 relative focus:outline-none pt-2 group cursor-pointer"
								>
									{/* The Dot */}
									<div className="relative flex items-center justify-center">
										{isActive && (
											<motion.div
												layoutId="activeGlow"
												className="absolute w-6 h-6 rounded-full bg-(--main-light) border border-(--main) shadow-custom"
												transition={{
													type: "spring",
													stiffness: 300,
													damping: 25,
												}}
											/>
										)}

										<div
											className={`w-3 h-3 rounded-full z-10 transition-all duration-300 border-2 ${
												isActive
													? "bg-(--main) border-(--main) scale-125"
													: "bg-(--primary-bg) border-(--border) group-hover:border-(--main)"
											}`}
										/>
									</div>

									{/* Year Text */}
									<span
										className={`text-sm font-bold transition-all duration-300 ${
											isActive
												? "text-(--main) scale-110"
												: "text-(--text-color) group-hover:text-(--main)"
										}`}
									>
										{item.year}
									</span>
								</button>
							);
						})}
					</div>
				</div>

				<div className="w-full relative px-2">
					<AnimatePresence mode="wait">
						<motion.div
							key={activeIndex}
							initial={{ opacity: 0, y: 15, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -15, scale: 0.98 }}
							transition={{ duration: 0.3, ease: "easeOut" }}
							className="bg-(--secondary-bg) rounded-custom p-8 md:p-12 shadow-custom relative overflow-hidden mx-auto"
						>
							<div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
								{/* Year Badge */}
								<div className="shrink-0">
									<BadgeBorder label={`${timelineData[activeIndex].year}`} />
								</div>
								<div className="space-y-3 max-w-2xl">
									<h2 className="heading-lg font-semibold text-(--text-color-emphasis)">
										{timelineData[activeIndex].title}
									</h2>
									<p className="text-(--text-color) text-lg leading-relaxed">
										{timelineData[activeIndex].description}
									</p>
								</div>
							</div>
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
		</section>
	);
}
