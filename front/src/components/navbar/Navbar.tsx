"use client";

import { useState, MouseEvent, useCallback, useEffect } from "react";
import {
	FiChevronDown,
	FiChevronRight,
	FiX,
	FiMenu,
	FiArrowLeft,
	FiSearch,
} from "react-icons/fi";

import ThemeButton from "./ThemeButton";
import YpLogo from "./YpLogo";

import Image from "next/image";
import SearchModal from "../search_modal/SearchModal";
import { useCoursesMenuData, usePropertyMenuData } from "./NavbarData";
import { CategoryProps } from "@/types/Types";
import { getErrorResponse, getUserAvatar } from "@/context/Callbacks";
import API from "@/context/API";
import Link from "next/link";
import { UserProps } from "@/types/UserTypes";
import { getProfile, getToken, handleLogout } from "@/context/getAssets";
import { LuLogOut } from "react-icons/lu";
import NavbarLoader from "@/ui/loader/component/NavbarLoader";
import SettingsOffcanvas from "../setting/SettingOffcanvas";
import HeadingLine from "@/ui/headings/HeadingLine";
import PropertyMegaMenu from "./PropertyMegaMenu";
// /types/NavbarTypes.ts

export interface MegaMenuLink {
	name: string;
	href?: string;
}

export interface MegaMenuSection {
	title: string;
	links: MegaMenuLink[];
	viewAll?: string;
}

export type MegaMenuGroup = Record<string, MegaMenuSection>;

export interface DropdownContent {
	[key: string]: MegaMenuGroup;
}
export interface MenuItem {
	name: string;
	href: string;
	dropdownContent?: DropdownContent;
	external?: boolean;
	menuType?: "property" | "course";
}

export interface MobileDetailMenuState {
	title: string;
	data: MegaMenuGroup;
}
export interface MobileSubMenuState {
	title: string;
	data: DropdownContent;
}

export default function Navbar() {
	const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
	const [activeDesktopSubMenu, setActiveDesktopSubMenu] = useState<
		string | null
	>(null);
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [mobileSubMenu, setMobileSubMenu] = useState<MobileSubMenuState | null>(
		null,
	);
	const [mobileDetailMenu, setMobileDetailMenu] =
		useState<MobileDetailMenuState | null>(null);

	const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
	const [category, setCategory] = useState<CategoryProps[]>();
	const { courseMenuData, courseLoading } = useCoursesMenuData();
	const collegeMenu = usePropertyMenuData({
		category,
		academicType: "college",
		basePath: "/colleges",
	});
	const universityMenu = usePropertyMenuData({
		category,
		academicType: "university",
		basePath: "/universities",
	});
	const [token, setToken] = useState("");
	const [profile, setProfile] = useState<UserProps | null>(null);
	const [settingOffcanvas, setSettingOffcanvas] = useState(false);

	useEffect(() => {
		const checkToken = async () => {
			const tokenRes = await getToken();
			const profileRes = await getProfile();
			if (profileRes) setProfile(profileRes);
			if (tokenRes) setToken(tokenRes);
		};
		checkToken();
	}, []);

	const getCategory = useCallback(async () => {
		try {
			const response = await API.get(`/category`);
			setCategory(response.data);
		} catch (error) {
			getErrorResponse(error, true);
		}
	}, []);

	useEffect(() => {
		getCategory();
	}, [getCategory]);

	const menuItems: MenuItem[] = [
		{
			name: "Colleges",
			href: "/colleges",
			menuType: "property",
			dropdownContent: collegeMenu.propertyMenuData,
		},
		{
			name: "Universities",
			href: "/universities",
			menuType: "property",
			dropdownContent: universityMenu.propertyMenuData,
		},
		{
			name: "Courses",
			href: "/courses",
			menuType: "course",
			dropdownContent: courseMenuData,
		},
		// { name: "Events", href: "/events", external: false },
		{
			name: "Ask",
			href: `${process.env.NEXT_PUBLIC_ASK_URL}`,
			external: true,
		},
	];
	/* ------------------ Helpers ---------------------- */

	const handleCloseMobileMenu = () => {
		setIsMobileMenuOpen(false);
		setTimeout(() => {
			setMobileSubMenu(null);
			setMobileDetailMenu(null);
		}, 300);
	};

	const toggleMobileMenu = () => {
		if (isMobileMenuOpen) {
			handleCloseMobileMenu();
		} else {
			setIsMobileMenuOpen(true);
		}
	};

	const handleSubMenuClick = (e: MouseEvent, item: MenuItem) => {
		if (item.dropdownContent) {
			e.preventDefault();
			setMobileSubMenu({ title: item.name, data: item.dropdownContent });
		}
	};

	const handleDetailMenuClick = (
		e: MouseEvent,
		subItemName: string,
		subItemData: Record<string, unknown> | MegaMenuGroup,
	) => {
		e.preventDefault();

		if (subItemData && Object.keys(subItemData).length > 0) {
			setMobileDetailMenu({
				title: subItemName,
				data: subItemData as MegaMenuGroup,
			});

			setActiveAccordion(Object.keys(subItemData)[0]);
		}
	};

	const handleDesktopMouseEnter = (item: MenuItem) => {
		if (!item.dropdownContent) return;

		setHoveredMenu(item.name);

		const firstKey = Object.keys(item.dropdownContent)[0];
		setActiveDesktopSubMenu(firstKey ?? null);
	};

	const handleDesktopMouseLeave = () => {
		setHoveredMenu(null);
	};

	const isPropertyLoading =
		collegeMenu.propertyLoading || universityMenu.propertyLoading;

	if (isPropertyLoading || courseLoading) {
		return <NavbarLoader />;
	}

	return (
		<>
			<header className="bg-(--primary-bg) shadow-sm sticky top-0 z-40 px-4 m-0">
				<div className="container mx-auto flex items-center justify-between h-16">
					<div className="lg:hidden flex w-full justify-between items-center">
						<div className="flex justify-start items-center">
							<div className="mt-1">
								<YpLogo />
							</div>
						</div>

						<div className="flex justify-start items-center gap-1">
							{/* <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-(--text-color) h-9 w-9 flex items-center justify-center rounded-md p-1"
              >
                <FiSearch className="h-5 w-5" />
              </button> */}

							<ThemeButton />
							<button onClick={toggleMobileMenu} className="p-2 -ml-2">
								<FiMenu className="w-6 h-6 text-(--text-color-emphasis)" />
							</button>
						</div>
					</div>

					<div className="hidden lg:flex w-full items-center justify-between gap-10">
						<YpLogo />

						<nav className="flex grow justify-start">
							<ul className="flex space-x-6 items-center">
								{menuItems.map((item: MenuItem) => (
									<li
										key={item.name}
										className="py-6 static"
										onMouseEnter={() => handleDesktopMouseEnter(item)}
										onMouseLeave={handleDesktopMouseLeave}
									>
										{/* Main Menu Link */}
										<Link
											href={item.href}
											className="text-(--text-color) hover:text-(--main) transition inline-flex items-center"
											onClick={handleDesktopMouseLeave}
											target={item?.external ? "_blank" : "_self"}
										>
											{item.name}
											{item.dropdownContent && (
												<FiChevronDown className="ml-1 mt-1 h-4 w-4" />
											)}
										</Link>

										{/* Desktop Dropdown */}
										{hoveredMenu === item.name && item.dropdownContent && (
											<div className="absolute top-full left-0 right-0 bg-(--primary-bg) shadow-custom border-t border-(--border) transition-all duration-300 ease-in-out">
												{["Courses"].includes(item?.name) && (
													<div className="container mx-auto p-6 space-y-10">
														{Object.entries(item?.dropdownContent).map(
															([sectionName, section]) => (
																<div key={sectionName}>
																	<HeadingLine
																		title={section?.main?.title || sectionName}
																		className="font-semibold text-(--text-color-emphasis)!"
																	/>

																	<ul className="grid grid-cols-4 gap-x-8">
																		{section?.main?.links.map((link) => (
																			<li key={link.name} className="py-3">
																				<Link
																					href={link?.href || ""}
																					onClick={handleDesktopMouseLeave}
																					className="text-sm text-(--text-color) hover:text-(--main)"
																				>
																					{link.name}
																				</Link>
																			</li>
																		))}
																	</ul>

																	{section?.main?.viewAll && (
																		<div className="mt-1 pt-1">
																			<Link
																				href={section.main.viewAll}
																				onClick={handleDesktopMouseLeave}
																				className="text-sm text-(--main) hover:underline"
																			>
																				VIEW ALL
																			</Link>
																		</div>
																	)}
																</div>
															),
														)}
													</div>
												)}

												{item.menuType === "property" &&
													item.dropdownContent && (
														<PropertyMegaMenu
															dropdownContent={item.dropdownContent}
															activeDesktopSubMenu={activeDesktopSubMenu}
															setActiveDesktopSubMenu={setActiveDesktopSubMenu}
															onClose={handleDesktopMouseLeave}
														/>
													)}
											</div>
										)}
									</li>
								))}
							</ul>
						</nav>

						{/* Right section */}
						<div className="flex items-center space-x-4 shrink-0">
							<button
								onClick={() => setIsSearchOpen(!isSearchOpen)}
								className="text-(--text-color-emphasis) h-10 w-10 flex items-center justify-center rounded-md cursor-pointer transition"
								title={"Search"}
							>
								<FiSearch className="h-5 w-5" />
							</button>

							<ThemeButton />
							<div className="relative">
								{!token ? (
									<Link
										href="/auth/login"
										className="flex items-center space-x-2 bg-(--secondary-bg) text-(--text-color-emphasis) hover:opacity-85 px-3 py-2 rounded-lg transition"
									>
										Login
									</Link>
								) : (
									<div className="relative">
										<SettingsOffcanvas
											isOpen={settingOffcanvas}
											onClose={() => setSettingOffcanvas(false)}
											profile={profile}
										/>
										<button
											onClick={() => setSettingOffcanvas(!settingOffcanvas)}
											className="flex items-center space-x-2 bg-(--secondary-bg) text-(--text-color-emphasis) hover:opacity-85 px-3 py-2 rounded-lg transition"
											title={profile?.username || "Profile"}
										>
											<div className="relative w-6 h-6">
												<Image
													src={getUserAvatar(profile?.avatar || [])}
													alt={profile?.username || "User avatar"}
													fill
													className="object-cover rounded-full"
												/>
											</div>
											<span className="text-sm font-medium truncate max-w-[100px]">
												{profile?.username}
											</span>
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* ------------------ Mobile Navigation ------------------ */}
			<div
				className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
					isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
			>
				{/* Background Overlay */}
				<div
					className="absolute inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50"
					onClick={handleCloseMobileMenu}
				></div>

				{/* Offcanvas Menu */}
				<div
					className={`fixed top-0 left-0 h-full w-full max-w-sm bg-(--primary-bg) shadow-custom transition-transform duration-300 ${
						isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
					}`}
				>
					<div className="relative w-full h-full overflow-hidden text-(--text-color-emphasis)">
						{/* Main Mobile Menu */}
						<div
							className={`absolute inset-0 transition-transform duration-300 ${
								mobileSubMenu ? "-translate-x-full" : "translate-x-0"
							}`}
						>
							<div className="h-full flex flex-col">
								{/* Header */}
								<div className="p-4 bg-(--main-emphasis) text-(--white) flex items-center justify-between">
									{token ? (
										<div className="flex items-center gap-3">
											<Link
												href={`/profile`}
												onClick={handleCloseMobileMenu}
												className="w-10 h-10 relative"
											>
												<Image
													src={getUserAvatar(profile?.avatar || [])}
													alt="User Avatar"
													fill
													className="rounded-full border-2 border-(--main-light) object-cover"
												/>
											</Link>
											<div>
												<Link
													href={`/profile`}
													onClick={handleCloseMobileMenu}
													className="font-semibold text-base!"
												>
													{profile?.username}
												</Link>
												<button
													onClick={handleLogout}
													className="rounded-custom text-xs flex gap-1 items-center justify-center"
												>
													<LuLogOut />
													Logout
												</button>
											</div>
										</div>
									) : (
										<div>
											<Link
												href={`/auth/login`}
												className="w-full  px-4 py-2 rounded-md font-semibold text-sm"
											>
												Login
											</Link>
										</div>
									)}

									<button onClick={handleCloseMobileMenu} className="p-1">
										<FiX className="w-5 h-5" />
									</button>
								</div>

								{/* Menu Items */}
								<nav className="grow overflow-y-auto">
									<ul className="flex flex-col">
										{menuItems.map((item: MenuItem) => (
											<li
												key={item.name}
												className="border-b border-(--border)"
											>
												<Link
													href={item.href}
													onClick={(e) => {
														handleSubMenuClick(e, item);
														if (item?.name === "Events") {
															handleCloseMobileMenu();
														}
													}}
													className="flex justify-between items-center p-4 transition-colors"
													target={item?.external ? "_blank" : "_self"}
												>
													<span>{item.name}</span>
													{item.dropdownContent && (
														<FiChevronRight className="w-5 h-5" />
													)}
												</Link>
											</li>
										))}
									</ul>
								</nav>
							</div>
						</div>

						{/* SubMenu Panel */}
						<div
							className={`absolute inset-0 transition-transform duration-300 bg-(--primary-bg) ${
								!mobileSubMenu ? "translate-x-full" : "translate-x-0"
							} ${mobileDetailMenu ? "-translate-x-full" : ""}`}
						>
							{mobileSubMenu && (
								<div className="h-full flex flex-col">
									<div className="p-4 bg-(--main-emphasis) flex items-center justify-between gap-4">
										<div className="flex items-center gap-4">
											<button
												onClick={() => setMobileSubMenu(null)}
												className="p-1"
											>
												<FiArrowLeft className="w-5 h-5" />
											</button>

											<h3 className="font-semibold text-lg">
												{mobileSubMenu.title}
											</h3>
										</div>

										<button onClick={handleCloseMobileMenu} className="p-1">
											<FiX className="w-5 h-5" />
										</button>
									</div>

									<nav className="grow overflow-y-auto">
										<ul className="flex flex-col">
											{Object.entries(mobileSubMenu.data).map(
												([subItemName, subItemData]) => (
													<li
														key={subItemName}
														className="border-b border-gray-200"
													>
														<Link
															href="#"
															onClick={(e) =>
																handleDetailMenuClick(
																	e,
																	subItemName,
																	subItemData,
																)
															}
															className="flex justify-between items-center hover:bg-gray-100 p-4"
														>
															<span>{subItemName}</span>
															<FiChevronRight className="w-5 h-5 text-gray-400" />
														</Link>
													</li>
												),
											)}
										</ul>
									</nav>
								</div>
							)}
						</div>
						<div
							className={`absolute inset-0 transition-transform duration-300 bg-(--primary-bg) ${
								!mobileDetailMenu ? "translate-x-full" : "translate-x-0"
							}`}
						>
							{mobileDetailMenu && (
								<div className="h-full flex flex-col">
									<div className="p-4 bg-(--main-emphasis) flex items-center justify-between gap-4">
										<div className="flex items-center gap-4">
											<button
												onClick={() => setMobileDetailMenu(null)}
												className="p-1"
											>
												<FiArrowLeft className="w-5 h-5" />
											</button>

											<h3 className="font-semibold text-lg">
												{mobileDetailMenu.title}
											</h3>
										</div>

										<button onClick={handleCloseMobileMenu} className="p-1">
											<FiX className="w-5 h-5" />
										</button>
									</div>

									<nav className="grow overflow-y-auto p-2">
										{Object.entries(mobileDetailMenu.data).map(
											([accordionTitle, accordionContent]) => {
												const isAccordionOpen =
													activeAccordion === accordionTitle;

												return (
													<div
														key={accordionTitle}
														className="border-b border-(--border)"
													>
														<button
															onClick={() =>
																setActiveAccordion(
																	isAccordionOpen ? null : accordionTitle,
																)
															}
															className="w-full flex justify-between items-center p-3 font-semibold text-left"
														>
															<HeadingLine
																title={accordionContent?.title}
																className="m-0!"
															/>
															<FiChevronDown
																className={`w-5 h-5 transition-transform ${
																	isAccordionOpen ? "rotate-180" : ""
																}`}
															/>
														</button>

														{isAccordionOpen && (
															<div className="p-3">
																<ul className="space-y-2">
																	{accordionContent.links.map((link) => (
																		<li key={link.name}>
																			<Link
																				href={link?.href || ""}
																				onClick={handleCloseMobileMenu}
																				className="text-sm text-(--text-color) hover:text-(--main)"
																			>
																				{link.name}
																			</Link>
																		</li>
																	))}

																	{accordionContent.viewAll && (
																		<li>
																			<Link
																				href={accordionContent.viewAll}
																				onClick={handleCloseMobileMenu}
																				className="text-sm text-(--main) hover:underline inline-block font-semibold mt-2"
																			>
																				VIEW ALL
																			</Link>
																		</li>
																	)}
																</ul>
															</div>
														)}
													</div>
												);
											},
										)}
									</nav>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Global Search Modal */}
			<SearchModal
				isOpen={isSearchOpen}
				onClose={() => setIsSearchOpen(false)}
			/>
		</>
	);
}
