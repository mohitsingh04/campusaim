"use client";
import { useEffect, useState } from "react";
import CountUp from "react-countup";
import Link from "next/link";
import { LuGraduationCap, LuUniversity } from "react-icons/lu";
import { RiPresentationLine } from "react-icons/ri";
import { GrYoga } from "react-icons/gr";
import { LiaUniversalAccessSolid } from "react-icons/lia";
import { generateSlug, getFieldDataSimpleWithCount } from "@/context/Callbacks";
import { HeadingProps } from "@/ui/headings/MainHeading";
import { PropertyProps } from "@/types/PropertyTypes";
import { FieldDataSimple } from "@/types/Types";
import AcademicTypeSkeleton from "@/ui/loader/page/landing/_components/AcademicTypeSkeleton";

export default function CategorySection({
	properties,
}: {
	properties: PropertyProps[];
}) {
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const [uniqueCategory, setUniqueCategory] = useState<FieldDataSimple[]>();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (properties?.length > 0) {
			const getData = async () => {
				setLoading(true);
				const data = await getFieldDataSimpleWithCount(properties, "category");
				setUniqueCategory(data);
				setLoading(false);
			};
			getData();
		}
	}, [properties]);

	const statsData = [
		{
			description:
				"Colleges providing structured yoga learning, wellness activities, and elective courses to integrate yoga into your academic life.",
			value:
				uniqueCategory?.find(
					(item) => generateSlug(item?.title) === generateSlug("College"),
				)?.value || 0,
			label: "College",
			icon: LuGraduationCap,
			colors: { sub: "--purple-subtle", emphasis: "--purple-emphasis" },
			href: "/colleges?category=college",
		},
		{
			description:
				"Pursue a formal degree or diploma! Universities offering certified yoga courses, educational programs, and accredited academic learning.",
			value:
				uniqueCategory?.find(
					(item) => generateSlug(item?.title) === generateSlug("University"),
				)?.value || 0,
			label: "University",
			icon: LuUniversity,
			colors: { sub: "--danger-subtle", emphasis: "--danger-emphasis" },
			href: "/universities?category=university",
		},
		// {
		// 	description:
		// 		"Explore a wide network of trusted and certified yoga training centers offering deep, transformative courses across India.",
		// 	value: properties?.length,
		// 	label: "All Yoga Institutes",
		// 	icon: LiaUniversalAccessSolid,
		// 	colors: { sub: "--blue-subtle", emphasis: "--blue-emphasis" },
		// 	href: "/yoga-institutes",
		// },
		// {
		// 	description:
		// 		"Top-rated studios offering authentic daily classes, weekend workshops, and expert guidance for all levels of practice.",
		// 	value:
		// 		uniqueCategory?.find(
		// 			(item) => generateSlug(item?.title) === generateSlug("Yoga Studio"),
		// 		)?.value || 0,
		// 	label: "Yoga Studio",
		// 	icon: GrYoga,
		// 	colors: { sub: "--gray-subtle", emphasis: "--gray-emphasis" },
		// 	href: "/yoga-institutes?category=yoga-studio",
		// },
		// {
		// 	description:
		// 		"Learn yoga anytime, anywhere! Access high-quality, live, and on-demand classes with expert online trainers from the comfort of your home.",
		// 	value:
		// 		uniqueCategory?.find(
		// 			(item) =>
		// 				generateSlug(item?.title) === generateSlug("Online Yoga Studio"),
		// 		)?.value || 0,
		// 	label: "Online Yoga Studio",
		// 	icon: RiPresentationLine,
		// 	colors: { sub: "--orange-subtle", emphasis: "--orange-emphasis" },
		// 	href: "/yoga-institutes?category=online-yoga-studio",
		// },
	];

	if (loading) return <AcademicTypeSkeleton />;

	return (
		<section className="relative bg-(--primary-bg)  py-10 px-4 sm:px-8  overflow-hidden">
			<div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-6">
				<HeadingProps
					tag="Find Your Yoga Fit"
					title=" Browse by "
					activetitle="Academic Type"
					subtitle="Verified colleges. Recognized universities. Accredited programs. Filter by your goals—whether you’re exploring courses, exams, or institutions."
				/>
				{/* Custom Navigation Buttons (Linked to Swiper via Refs) */}
			</div>
			<div className="relative z-10">
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
					{statsData.map((item, idx) => (
						<Card
							key={idx}
							item={item}
							idx={idx}
							hoverIndex={hoverIndex}
							setHoverIndex={setHoverIndex}
						/>
					))}
				</div>
			</div>
		</section>
	);
}

/* ------------------------------ CARD COMPONENT ------------------------------ */
function Card({ item, idx, hoverIndex, setHoverIndex }: any) {
	const Icon = item.icon;
	const isHovered = hoverIndex === idx;

	const iconBg = isHovered
		? `var(${item.colors.sub})`
		: `var(${item.colors.emphasis})`;
	const iconColor = isHovered
		? `var(${item.colors.emphasis})`
		: `var(${item.colors.sub})`;

	return (
		<Link
			href={item?.href}
			onPointerEnter={() => setHoverIndex(idx)}
			onPointerLeave={() => setHoverIndex(null)}
			onFocus={() => setHoverIndex(idx)}
			onBlur={() => setHoverIndex(null)}
			className="group rounded-xl p-5 bg-(--secondary-bg) shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col gap-3 h-full"
		>
			<div className="flex items-center justify-between">
				<div
					style={{ backgroundColor: iconBg, color: iconColor }}
					className="w-10 h-10 rounded-xl flex items-center justify-center"
				>
					<div className="border-2 rounded-xl p-1 flex items-center justify-center">
						<Icon className="w-5 h-5" />
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between text-(--text-color-emphasis)">
				<h4 className="text-lg md:text-sm font-semibold underline-offset-2">
					{item.label}
				</h4>

				<div className="text-lg md:text-sm font-bold tabular-nums">
					<CountUp start={0} end={item.value} duration={2} />+
				</div>
			</div>

			<p className="text-base sm:text-sm text-(--text-color)">
				{item.description}
			</p>
		</Link>
	);
}
