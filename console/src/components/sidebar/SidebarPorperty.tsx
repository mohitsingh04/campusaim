import { useCallback, useEffect, useState } from "react";
import { X, Home } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Select, { SingleValue } from "react-select";
import { CategoryProps, PropertyProps, UserProps } from "../../types/types";
import { API } from "../../contexts/API";
import { getErrorResponse } from "../../contexts/Callbacks";
import { TbMenuDeep } from "react-icons/tb";
import { PropertySidebarData } from "../../common/PropertySidebarData";
import { reactSelectDesignClass } from "../../common/ExtraData";
import { useTheme } from "../../hooks/useTheme";

interface SidebarProps {
	isCollapsed: boolean;
	authUser: UserProps;
	categories: CategoryProps[];
}

interface PropertyOption {
	label: string;
	value: string;
}

export function SidebarProperty({
	isCollapsed,
	authUser,
	categories,
}: SidebarProps) {
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const [property, setProperty] = useState<PropertyProps[] | null>(null);
	const [selectedProperty, setSelectedProperty] =
		useState<PropertyProps | null>(null);
	const { theme } = useTheme();

	const location = useLocation();
	const navigate = useNavigate();
	const searchParams = new URLSearchParams(location.search);
	const activeTab = searchParams.get("tab");

	const getProperty = useCallback(async () => {
		if (!authUser?._id) return;
		try {
			const response = await API.get(`/property/userId/${authUser?._id}`);
			setProperty(response.data);

			if (response.data.length > 0 && !selectedProperty) {
				setSelectedProperty(response.data[0]);
			}
		} catch (error) {
			getErrorResponse(error, true);
			setProperty([]);
		}
	}, [authUser?._id, selectedProperty]);

	useEffect(() => {
		getProperty();
	}, [getProperty]);

	const getCategoryById = (id: string) => {
		const cat = categories.find((item) => item.uniqueId === Number(id));
		return cat?.category_name;
	};

	const isOnline =
		getCategoryById(selectedProperty?.category || "")?.toLowerCase() ===
		"online yoga studio";

	const MobileToggle = () => (
		<button
			onClick={() => setIsMobileOpen(!isMobileOpen)}
			className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--yp-primary)] rounded-lg"
		>
			{isMobileOpen ? (
				<X className="w-8 h-8 text-[var(--yp-muted)]" />
			) : (
				<TbMenuDeep className="w-8 h-8 text-[var(--yp-muted)] rotate-180" />
			)}
		</button>
	);

	const MobileOverlay = () =>
		isMobileOpen && (
			<div
				className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
				onClick={() => setIsMobileOpen(false)}
			/>
		);

	const SidebarContent = () => {
		if (property === null) return null;
		const hasProperty = property.length > 0;

		const sidebarItems = hasProperty
			? PropertySidebarData(selectedProperty, isOnline)
			: [{ name: "Dashboard", href: "/dashboard", icon: Home, online: false }];

		return (
			<>
				{/* Logo */}
				<div className="flex items-center justify-center px-2 py-6 border-b border-[var(--yp-border-primary)] flex-shrink-0">
					<Link to={`/`}>
						{isCollapsed && !isMobileOpen ? (
							<>
								{theme === "dark" ? (
									<img
										src="/img/logo/logo-small-white.png"
										alt="Logo Small Black"
										className="h-8 w-auto"
									/>
								) : (
									<img
										src="/img/logo/logo-small-black.png"
										alt="Logo Small Black"
										className="h-8 w-auto"
									/>
								)}
							</>
						) : (
							<>
								{theme === "dark" ? (
									<img
										src="/img/logo/campusaim-logo.png"
										alt="Logo White"
										className="h-8 w-auto"
									/>
								) : (
									<img
										src="/img/logo/campusaim-logo.png"
										alt="Logo Black"
										className="h-8 w-auto"
									/>
								)}
							</>
						)}
					</Link>
				</div>

				{/* Property Select */}
				{!isCollapsed && hasProperty && (
					<div className="px-3 mt-4">
						<Select<PropertyOption, false>
							options={[
								...property.map((p) => ({
									label: p.property_name,
									value: p._id,
								})),
								{ label: "➕ Create New Property", value: "create_new" },
							]}
							value={
								selectedProperty
									? {
											label: selectedProperty.property_name,
											value: selectedProperty._id,
									  }
									: null
							}
							onChange={(option: SingleValue<PropertyOption>) => {
								if (!option) return;

								if (option.value === "create_new") {
									navigate("/dashboard/property/create");
									return;
								}

								const prop = property.find((p) => p._id === option.value);
								setSelectedProperty(prop || null);

								if (prop) {
									navigate(`/dashboard/property/${prop._id}`);
								}
							}}
							placeholder="Select or Create Property"
							classNames={reactSelectDesignClass}
						/>
					</div>
				)}

				{/* Navigation */}
				<nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-hide">
					{sidebarItems
						?.filter((item) => !item?.online)
						?.map((item, index) => {
							const isActive =
								location.pathname === item.href.split("?")[0] &&
								(item.href.includes("?tab=")
									? activeTab === item.href.split("=")[1]
									: true);

							return (
								<div key={index}>
									<Link
										to={item.href}
										onClick={() => setIsMobileOpen(false)}
										title={item?.name}
										className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
											isActive
												? "bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
												: "text-[var(--yp-text-primary)] hover:bg-[var(--yp-tertiary)]"
										} ${isCollapsed && !isMobileOpen ? "justify-center" : ""}`}
									>
										<item.icon
											className={`w-5 h-5 shrink-0 ${
												isCollapsed && !isMobileOpen ? "" : "mr-3"
											}`}
										/>
										{(!isCollapsed || isMobileOpen) && item.name}
									</Link>
								</div>
							);
						})}
				</nav>
			</>
		);
	};

	return (
		<>
			<MobileToggle />
			<MobileOverlay />

			{/* Desktop Sidebar */}
			<div
				className={`hidden lg:flex fixed inset-y-0 left-0 bg-[var(--yp-primary)] border-r border-[var(--yp-border-primary)] transition-all duration-300 ${
					isCollapsed ? "w-16" : "w-64"
				} flex-col z-40`}
			>
				<SidebarContent />
			</div>

			{/* Mobile Sidebar */}
			<div
				className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[var(--yp-primary)] border-r border-[var(--yp-border-primary)] transform transition-transform duration-300 ease-in-out ${
					isMobileOpen ? "translate-x-0" : "-translate-x-full"
				} flex flex-col`}
			>
				<SidebarContent />
			</div>
		</>
	);
}
