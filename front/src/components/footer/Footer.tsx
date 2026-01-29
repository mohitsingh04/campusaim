"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { LuHeart } from "react-icons/lu";
import Image from "next/image";
import { PropertyLocationProps } from "@/types/PropertyTypes";
import API from "@/context/API";
import { RetreatProps, SimpleLocationProps } from "@/types/Types";
import { generateSlug, getErrorResponse } from "@/context/Callbacks";
import { socailLinks } from "@/common/SocailMedaiData";
import SearchModal from "../search_modal/SearchModal";
import HeadingLine from "@/ui/headings/HeadingLine";
import FooterLoader from "@/ui/loader/component/FooterLoader";
import MobileBottomBar from "@/ui/loader/component/MobileBottomBar";
import { BottomNavBar } from "./BottomNavbar";
import { useResponsive } from "@/hooks/useResponsive";
import { LEGAL_LINKS } from "@/common/LegalLinks";

const Countries = [
	{
		name: "India",
		image: "/img/country-flag/country-india.webp",
	},
	{
		name: "United States",
		image: "/img/country-flag/country-united-states.webp",
	},
	{
		name: "Nepal",
		image: "/img/country-flag/country-nepal.webp",
	},
	{
		name: "Canada",
		image: "/img/country-flag/country-canada.webp",
	},
	{
		name: "Russia",
		image: "/img/country-flag/country-russia.webp",
	},
	{ name: "peru", href: "#", image: "/img/country-flag/country-peru.webp" },
	{
		name: "Spain",
		image: "/img/country-flag/country-spain.webp",
	},
	{
		name: "Thailand",
		image: "/img/country-flag/country-thailand.webp",
	},
	{
		name: "Ireland",
		image: "/img/country-flag/country-ireland.webp",
	},
];

const CategoriesList = [
	{ name: "University" },
	{ name: "College" },
	{ name: "Yoga Studio" },
	{ name: "Online Yoga Studio" },
];

const CoursesList = [
	{ name: "100 Hours YTT", href: "100-hour-yoga-teacher-training" },
	{ name: "200 Hours YTT", href: "200-hour-yoga-teacher-training" },
	{ name: "300 Hours YTT", href: "300-hour-yoga-teacher-training-late" },
	{ name: "500 Hours YTT", href: "500-hour-yoga-teacher-training" },
];

const ImportantLink = [
	{ name: "Ask Prerna (AI)", href: "/ask-prerna", external: false },
	{ name: "About Us", href: "/about-us", external: false },
	{ name: "News & Updates", href: "/news-and-updates", external: false },
	{ name: "Blog", href: "/blog", external: false },
	{ name: "Compare", href: "/compare/select", external: false },
	{ name: "Events", href: "/events", external: false },
	{
		name: "Add Your Institute",
		href: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}`,
		external: true,
	},
	{
		name: "Career",
		href: `${process.env.NEXT_PUBLIC_CAREER_URL}`,
		external: true,
	},
	{
		name: "Ask (Community)",
		href: `${process.env.NEXT_PUBLIC_ASK_URL}`,
		external: true,
	},
	{ name: "Contact Us", href: "/contact-us", external: false },
];

const FEATURE_LINKS = [
	{
		name: "Ask Community",
		href: `${process.env.NEXT_PUBLIC_ASK_URL}`,
		external: true,
	},
	{ name: "Compare", href: "/compare/select", external: false },
	{ name: "Professional", href: "/comming-soon", external: false },
	{
		name: "Ask CA (AI)",
		href: "/ask-prerna",
		badge: "Beta",
		external: true,
	},
];

const resolveComingSoonHref = (href: string, pathname: string) => {
	if (!href) return href;

	if (href === "/comming-soon") {
		return `${href}?source=${pathname?.replace("/", "")}`;
	}

	// also handle external coming-soon links if needed
	if (href.startsWith("/comming-soon")) {
		return `${href}&source=${pathname?.replace("/", "")}`;
	}

	return href;
};

const FooterSitemapSection = ({
	uniqueLocations,
	retreats,
}: {
	uniqueLocations: SimpleLocationProps[];
	retreats: RetreatProps[];
}) => {
	return (
		<div className="bg-(--primary-bg) py-8">
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6 md:gap-3 ">
				{/* Countries */}
				<div>
					<HeadingLine title="Countries" className="text-xs font-bold!" />

					<ul className="space-y-2 footer-list">
						{Countries.map((item, i) => (
							<li key={i}>
								<Link
									href={`/yoga-institutes?country=${generateSlug(
										item?.name || "",
									)}`}
									className="text-(--text-color) hover:text-(--main) flex items-center gap-2 transition"
								>
									{item.image ? (
										<div className="relative h-4 w-6 rounded-sm overflow-hidden">
											<Image src={item.image} alt={`${item.name} flag`} fill />
										</div>
									) : null}

									{item.name}
								</Link>
							</li>
						))}
					</ul>
				</div>

				{/* Locations */}
				<div>
					<HeadingLine title="Locations" className="text-xs font-bold!" />

					<ul className="space-y-2 footer-list">
						{uniqueLocations?.map((item, i) => (
							<li key={i}>
								<Link
									href={`/yoga-institutes?city=${generateSlug(
										item?.city || "",
									)}&state=${generateSlug(
										item?.state || "",
									)}&country=${generateSlug(item?.country || "")}`}
									className="text-(--text-color) hover:text-(--main) flex items-center gap-2 transition"
								>
									{item.city}
								</Link>
							</li>
						))}
					</ul>
					<Link
						href={"/yoga-institutes"}
						className="text-(--main) hover:underline text-xs font-semibold"
					>
						View all
					</Link>
				</div>

				{/* Categories */}
				<div>
					<div>
						<HeadingLine
							title="Yoga By Categories"
							className="text-xs font-bold!"
						/>

						<ul className="space-y-2 footer-list">
							{CategoriesList.map((item, i) => (
								<li key={i}>
									<Link
										href={`/yoga-institutes?category=${generateSlug(
											item?.name || "",
										)}`}
										className="text-(--text-color) hover:text-(--main) flex items-center gap-2 transition"
									>
										{item.name}
									</Link>
								</li>
							))}
						</ul>
					</div>
					<div className="mt-3">
						<HeadingLine
							title="Yoga Teacher Training"
							className="text-xs font-bold!"
						/>

						<ul className="space-y-2 footer-list">
							{CoursesList.map((item, i) => (
								<li key={i}>
									<Link
										href={`/courses/${generateSlug(item?.href || "")}`}
										className="text-(--text-color) hover:text-(--main) flex items-center gap-2 transition"
									>
										{item.name}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Retreats */}
				<div>
					<HeadingLine
						title="Retreat Programs"
						className="text-xs font-bold!"
					/>

					<ul className="space-y-2 footer-list">
						{retreats?.slice(0, 9)?.map((item, i) => (
							<li key={i}>
								<Link
									href={`/retreat/${generateSlug(item?.retreat_name || "")}`}
									className="text-(--text-color) hover:text-(--main) flex items-center gap-2 transition"
								>
									{item.retreat_name}
								</Link>
							</li>
						))}
					</ul>
					{retreats?.length > 9 && (
						<Link
							href={"/courses"}
							className="text-(--main) hover:underline text-xs font-semibold"
						>
							View all
						</Link>
					)}
				</div>

				{/* Important Links */}
				<div>
					<HeadingLine title="Important Links" className="text-xs font-bold!" />

					<ul className="space-y-2 footer-list">
						{ImportantLink.map((item, i) => (
							<li key={i}>
								<Link
									href={resolveComingSoonHref(
										item?.href,
										generateSlug(item?.name),
									)}
									target={item?.external ? "_blank" : "_self"}
									className="text-(--text-color) hover:text-(--main) flex items-center gap-2 transition"
								>
									{item.name}
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div>
					<HeadingLine title="Queries" className="text-xs font-bold!" />

					<ul className="space-y-2 footer-list">
						{uniqueLocations?.slice(0, 9)?.map((item, i) => (
							<li key={i}>
								<Link
									href={`/top-yoga-studio-in-${generateSlug(item?.city || "")}`}
									className="text-(--text-color) hover:text-(--main) flex items-center gap-2 transition capitalize"
								>
									top yoga studio in {item?.city}
								</Link>
							</li>
						))}
					</ul>
				</div>
				<div>
					<HeadingLine title="Important Links" className="text-xs font-bold!" />

					<ul className="space-y-2 footer-list">
						{Countries?.slice(0, 9)?.map((item, i) => (
							<li key={i}>
								<Link
									href={`/top-yoga-studio-in-${generateSlug(item?.name || "")}`}
									className="text-(--text-color) hover:text-(--main) flex items-center gap-2 transition capitalize"
								>
									top yoga studio in {item?.name}
								</Link>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
};

const DesktopFooter = ({
	uniqueLocations,
	retreats,
}: {
	uniqueLocations: SimpleLocationProps[];
	retreats: RetreatProps[];
}) => {
	return (
		<footer className="bg-(--primary-bg) text-(--text-color) py-10 px-4 sm:px-8">
			<div className="container mx-auto ">
				<FooterSitemapSection
					uniqueLocations={uniqueLocations}
					retreats={retreats}
				/>

				<hr className="border-(--border) my-3" />

				<div className="border-b border-(--border) mb-6">
					<div className="flex flex-wrap justify-center heading-sm gap-x-8 gap-y-2 mb-3">
						{FEATURE_LINKS.map((item, i) => (
							<Link
								key={i}
								href={resolveComingSoonHref(
									item?.href,
									generateSlug(item?.name),
								)}
								target={item?.external ? "_blank" : "_self"}
								className="flex items-center text-(--text-color-emphasis) hover:text-(--main) transition-colors"
							>
								{item.name}
								{item.badge && (
									<span className="bg-(--main-light) text-(--main-emphasis) text-xs px-2 py-1 rounded-full ml-2">
										{item.badge}
									</span>
								)}
							</Link>
						))}
					</div>
					<div className="flex flex-wrap justify-center heading-sm gap-x-8 gap-y-2 my-5">
						{socailLinks.map((item, i) => {
							const Icon = item.icon;
							return (
								<a
									key={i}
									href={item.href}
									title={item.name}
									target="_blank"
									className="p-1 text-(--text-color-emphasis) rounded-full hover:shadow-sm hover:scale-110 hover:rotate-12 transition"
								>
									<Icon className="w-5 h-5" />
								</a>
							);
						})}
					</div>
				</div>

				<div className="text-center text-sm mb-6">
					{LEGAL_LINKS.map((item, i) => (
						<span key={i}>
							<Link
								href={item.href}
								className="hover:underline transition-colors text-(--text-color-emphasis) hover:text-(--main)"
							>
								{item.name}
							</Link>

							{i !== LEGAL_LINKS.length - 1 && <span className="mx-2">|</span>}
						</span>
					))}
				</div>

				<div className="text-center text-sm">
					<p className="mb-10 md:mb-2 text-(--text-color-emphasis)">
						© {new Date().getFullYear()}{" "}
						<Link href="/" className="font-medium text-(--main)">
							Campusaim
						</Link>{" "}
						, Inc. All Rights Reserved.
					</p>

					<p className="flex items-center justify-center text-(--text-color-emphasis)">
						Build with{" "}
						<span className="mx-1">
							<LuHeart className="fill-(--danger) text-(--danger)" />
						</span>
					</p>
				</div>
			</div>
		</footer>
	);
};

const Footer = () => {
	const [retreats, setRetreats] = useState<RetreatProps[]>([]);
	const [unqieLocations, setUnqieLocations] = useState<SimpleLocationProps[]>(
		[],
	);
	const [loading, setLoading] = useState(true);
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	const getAssets = useCallback(async () => {
		setLoading(true);

		try {
			const results = await Promise.allSettled([
				API.get("/locations"),
				API.get("/retreat"),
			]);

			const getData = (index: number) =>
				results[index].status === "fulfilled" ? results[index].value?.data : [];

			const locationRes = getData(0);
			const retreatRes = getData(1);

			setRetreats(retreatRes);

			const uniqueLocations = [
				...new Set(
					(locationRes || [])
						.map((loc: PropertyLocationProps) =>
							JSON.stringify({
								city: loc.property_city?.trim(),
								state: loc.property_state?.trim(),
								country: loc.property_country?.trim(),
							}),
						)
						.filter(Boolean),
				),
			].map((item) => JSON.parse(item as string) as SimpleLocationProps);

			setUnqieLocations(uniqueLocations.slice(0, 9));
		} catch (error) {
			getErrorResponse(error, true);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		getAssets();
	}, [getAssets]);

	const isMobile = useResponsive();

	if (loading)
		return (
			<>
				{isMobile && <MobileBottomBar />}
				<FooterLoader />
			</>
		);

	return (
		<>
			<DesktopFooter uniqueLocations={unqieLocations} retreats={retreats} />
			{isMobile && <BottomNavBar setIsSearchOpen={setIsSearchOpen} />}
			<SearchModal
				isOpen={isSearchOpen}
				onClose={() => setIsSearchOpen(false)}
			/>
		</>
	);
};

export default Footer;
