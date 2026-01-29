"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuSearch } from "react-icons/lu";
import Link from "next/link";
import { useRotatingPlaceholder } from "@/hooks/useRotatingPlaceholder";
import { placeholderText } from "@/common/ExtraData";
import { useResponsive } from "@/hooks/useResponsive";

const yogaTags = [
	{
		title: "Colleges",
		href: "/colleges?category=college",
		external: false,
	},
	{
		title: "Universities",
		href: "/universities?category=university",
		external: false,
	},
	{
		title: "Community (Ask)",
		href: `${process.env.NEXT_PUBLIC_ASK_URL}`,
		external: true,
	},
	{
		title: "Exams",
		href: "/exams",
		external: false,
	},
	{
		title: "Scholarships",
		href: "/scholarships",
		external: false,
	},
	{
		title: "Compare",
		href: "/compare/select",
		external: false,
	},
	// {
	// 	title: "Not Sure? Try Ask Prerna (Ai)",
	// 	href: "/ask-prerna",
	// 	external: false,
	// },
];
const texts = ["COLLEGES", "UNIVERSITIES", "ACADEMIES", "DEFENCE SCHOOLS"];

export function Hero({ modalOpen }: { modalOpen: () => void }) {
	const { value: rotatingPlaceholder } =
		useRotatingPlaceholder(placeholderText);
	const { value: rotatingText, index: rotatingTextIndex } =
		useRotatingPlaceholder(texts);
	const isMobile = useResponsive();

	const colors = ["--danger", "--blue", "--success", "--purple"];

	return (
		<section className="relative bg-(--primary-bg) text-(--text-color-emphasis) min-h-[80vh] sm:min-h-screen pt-10 sm:py-0 overflow-hidden flex justify-center items-center text-center">
			{/* <div
				className="absolute -top-10 -left-40 xl:-left-60 hidden md:block h-full bg-cover bg-center bg-no-repeat w-full md:w-2/5"
				style={{
					backgroundImage: "url('/img/main-images/yp-hero.webp')",
					backgroundSize: "contain",
					backgroundPosition: "center right",
				}}
			/> */}

			<div className="relative z-10 py-10 px-4 sm:px-8 h-full flex flex-col justify-center items-center text-center">
				{/* Heading Section */}
				<div className="w-full sm:my-6">
					<h1 className="flex flex-wrap justify-center items-center gap-2">
						<motion.span
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6 }}
							className="text-xl md:text-4xl font-medium"
						>
							Easily Find{" "}
						</motion.span>

						<div className="overflow-hidden">
							<AnimatePresence mode="wait">
								<motion.span
									key={rotatingTextIndex}
									initial={{ y: 50, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: -50, opacity: 0 }}
									transition={{ duration: 0.5 }}
									className="text-2xl md:text-4xl font-medium block"
									style={{ color: `var(${colors[rotatingTextIndex]})` }}
								>
									{rotatingText}
								</motion.span>
							</AnimatePresence>
						</div>
					</h1>
				</div>

				{/* Subtitle */}
				<div className="text-center max-w-3xl mx-auto mb-6 md:mb-8">
					<h4 className="text-(--text-color)">
						Discover colleges and universities that match your academic goals.
					</h4>
				</div>

				{/* Search Bar */}
				<div className="max-w-3xl mx-auto w-full mb-6 md:mb-8">
					<div
						className="w-full bg-(--primary-bg) border border-(--border) rounded-3xl sm:rounded-full shadow-custom py-0 px-0"
						onClick={modalOpen}
					>
						<div className="grid grid-cols-[1fr_auto] gap-2 items-center">
							<input
								type="text"
								placeholder={`Search "${rotatingPlaceholder}"`}
								className="bg-transparent outline-none text-sm px-4 py-2"
							/>

							<button
								className={`w-full sm:w-auto ${
									isMobile ? "" : "btn-shine"
								}  rounded-full sm:px-6 px-3 py-2 flex items-center justify-center gap-2 m-1`}
							>
								<LuSearch className="w-5 h-5" />
								<span className="hidden md:block">Search</span>
							</button>
						</div>
					</div>
				</div>

				<div className="mb-6 md:mb-8">
					<div className="flex flex-wrap justify-center gap-1.5 md:gap-2 max-w-3xl mx-auto">
						{yogaTags?.map((tag, index) => (
							<Link
								href={tag.href}
								key={index}
								target={tag?.external ? "_blank" : "_self"}
								className="px-2 py-2 md:py-2.5 hover:underline text-(--primary-hover-l) transition-all duration-300 hover:text-(--main) hover:scale-105 text-xs md:text-sm whitespace-nowrap"
							>
								{tag.title}
							</Link>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
