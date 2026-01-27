import { useCallback, useEffect, useMemo, useState } from "react";
import {
	MapPin,
	Users,
	BookOpen,
	Bed,
	ListChecks,
	Image,
	HelpCircle,
	Eye,
	BarChart2,
	Gift,
	FileText,
	Map,
	ExternalLink,
	Megaphone,
	Handshake,
	GraduationCap,
	BadgeDollarSign,
	MessageCircle,
	Medal,
} from "lucide-react";
import { BiSolidCheckShield, BiSolidShieldX } from "react-icons/bi";
import {
	Link,
	useNavigate,
	useOutletContext,
	useParams,
} from "react-router-dom";

import { PropertyTabs } from "../../ui/tabs/PropertyTabs";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import ViewSkeleton from "../../ui/skeleton/ViewSkeleton";

import { API } from "../../contexts/API";
import {
	generateSlug,
	getErrorResponse,
	matchPermissions,
} from "../../contexts/Callbacks";

import { DashboardOutletContextProps, PropertyProps } from "../../types/types";

// Components
import FAQs from "./property_component/faqs/Faqs";
import Gallery from "./property_component/gallery/Gallery";
import Location from "./property_component/location/Location";
import Teachers from "./property_component/teacher/Teacher";
import SEODetails from "./property_component/seo/Seo";
import Amenities from "./property_component/amenities/Amenities";
import Accomodation from "./property_component/accomodation/Accomodation";
import Review from "./property_component/review/Review";
import BasicDetails from "./property_component/basic-details/BasicDetails";
import { Enquiry } from "./property_component/enquiry/Enquiry";
import CourseList from "./property_component/course/CourseList";
import Scholarship from "./property_component/scholarship/Scholarship";
import AdmissionProcess from "./property_component/admission_process/AdmissionProcess";
import LoanProcess from "./property_component/loan_process/LoanProcess";
import Announcement from "./property_component/announcement/Announcement";
import QnA from "./property_component/qna/QnA";
import Ranking from "./property_component/ranking/Ranking";

export function PropertyView() {
	const navigate = useNavigate();
	const { objectId } = useParams();

	const { authUser, authLoading, categories } =
		useOutletContext<DashboardOutletContextProps>();

	const [property, setProperty] = useState<PropertyProps | null>(null);
	const [allProperty, setAllProperty] = useState<PropertyProps | null>(null);
	const [location, setLocation] = useState<any>(null);

	const [propertyLoading, setPropertyLoading] = useState(true);
	const [allPropertyLoading, setAllPropertyLoading] = useState(true);

	// 🔑 Single source of truth
	const loading = authLoading || propertyLoading || allPropertyLoading;

	// ---------- AUTH GUARD ----------
	useEffect(() => {
		if (authLoading || !property) return;

		if (
			(authUser?.role === "Property Manager" || authUser?.role === "User") &&
			property.userId !== authUser?._id
		) {
			navigate("/dashboard");
		}
	}, [authLoading, authUser, property, navigate]);

	// ---------- API CALLS ----------
	const getAllProperty = useCallback(async () => {
		setAllPropertyLoading(true);
		try {
			const res = await API.get("/property");
			setAllProperty(res.data);
		} catch (err) {
			getErrorResponse(err, true);
		} finally {
			setAllPropertyLoading(false);
		}
	}, []);

	const getProperty = useCallback(async () => {
		setPropertyLoading(true);
		try {
			const [propertyRes, locationRes] = await Promise.allSettled([
				API.get(`/property/${objectId}`),
				API.get(`/property/location/${objectId}`),
			]);

			if (propertyRes.status === "fulfilled") {
				setProperty(propertyRes.value.data);
			}

			if (locationRes.status === "fulfilled") {
				setLocation(locationRes.value.data);
			}
		} catch (err) {
			getErrorResponse(err, true);
		} finally {
			setPropertyLoading(false);
		}
	}, [objectId]);

	useEffect(() => {
		getProperty();
		getAllProperty();
	}, [getProperty, getAllProperty]);

	// ---------- HELPERS ----------
	const getCategoryById = useCallback(
		(id: any) => categories.find((c) => c._id === id)?.category_name,
		[categories],
	);

	const isOnline = useMemo(() => {
		return (
			getCategoryById(property?.category || "")?.toLowerCase() ===
			"online yoga studio"
		);
	}, [property, getCategoryById]);

	// ---------- LOADING ----------
	if (loading) {
		return <ViewSkeleton />;
	}

	// ---------- TABS ----------
	const tabs = [
		{
			id: "enquiry",
			label: "Enquiry",
			icon: Map,
			component: <Enquiry property={property} />,
			online: false,
		},
		{
			id: "analytics",
			label: "Analytics",
			icon: BarChart2,
			redirect: `/dashboard/property/${property?._id}/analytics`,
			component: <div />,
			online: false,
		},
		{
			id: "basic-details",
			label: "Basic Details",
			icon: BookOpen,
			component: (
				<BasicDetails
					property={property}
					allProperty={allProperty}
					categories={categories}
					getCategoryById={getCategoryById}
					getPropertyBasicDetails={getProperty}
				/>
			),
			online: false,
		},
		{
			id: "location",
			label: "Location",
			icon: MapPin,
			component: (
				<Location
					property={property}
					location={location}
					getPropertyLocation={getProperty}
				/>
			),
			online: isOnline,
		},
		{
			id: "gallery",
			label: "Gallery",
			icon: Image,
			component: <Gallery property={property} />,
			online: false,
		},
		{
			id: "course",
			label: "Course",
			icon: ListChecks,
			component: (
				<CourseList
					property={property}
					allProperty={allProperty}
					getCategoryById={getCategoryById}
				/>
			),
			online: false,
		},
		{
			id: "review",
			label: "Review",
			icon: HelpCircle,
			component: <Review property={property} />,
			online: false,
		},
		{
			id: "faqs",
			label: "FAQs",
			icon: FileText,
			component: <FAQs property={property} />,
			online: false,
		},
		{
			id: "seo",
			label: "SEO",
			icon: Eye,
			component: <SEODetails property={property} />,
			online: false,
		},
		{
			id: "teachers",
			label: "Faculty",
			icon: Users,
			component: <Teachers property={property} />,
			online: false,
		},
		{
			id: "accomodation",
			label: "Accomodation",
			icon: Bed,
			component: <Accomodation property={property} />,
			online: isOnline,
		},
		{
			id: "amenities",
			label: "Amenities",
			icon: Gift,
			component: <Amenities property={property} />,
			online: isOnline,
		},
		{
			id: "scholarship",
			label: "Scholarship",
			icon: BadgeDollarSign,
			component: <Scholarship property={property} />,
			online: isOnline,
		},
		{
			id: "admission_process",
			label: "Admission Process",
			icon: GraduationCap,
			component: <AdmissionProcess property={property} />,
			online: isOnline,
		},
		{
			id: "announcement",
			label: "Announcement",
			icon: Megaphone,
			component: <Announcement property={property} />,
			online: isOnline,
		},
		{
			id: "loan_process",
			label: "Loan Process",
			icon: Handshake,
			component: <LoanProcess property={property} />,
			online: isOnline,
		},
		{
			id: "qna",
			label: "QnA",
			icon: MessageCircle,
			component: <QnA property={property} />,
			online: false,
		},
		{
			id: "ranking",
			label: "Ranking",
			icon: Medal,
			component: <Ranking property={property} />,
			online: false,
		},
	];

	return (
		<div>
			<Breadcrumbs
				title="Property"
				breadcrumbs={[
					{ label: "Dashboard", path: "/dashboard" },
					{ label: "Property", path: "/dashboard/property" },
					{ label: property?.property_name || "" },
				]}
			/>

			<div className="bg-[var(--yp-primary)] rounded-xl shadow-sm mb-6 p-6 relative">
				<div className="flex items-start space-x-6">
					{/* Property Logo */}
					<div className="w-24 h-24 bg-[var(--yp-secondary)] shadow-inner rounded-full flex items-center justify-center overflow-hidden">
						{property?.property_logo?.[0] ? (
							<img
								src={`${import.meta.env.VITE_MEDIA_URL}/${
									property.property_logo[0]
								}`}
								alt={property.property_name}
								className="w-full h-full object-cover"
							/>
						) : (
							<span className="text-[var(--yp-text-primary)] font-bold text-2xl">
								{property?.property_name?.charAt(0).toUpperCase() || "P"}
							</span>
						)}
					</div>

					{/* Property Details */}
					<div className="flex-1 flex justify-between">
						<div>
							<div className="flex items-center gap-2">
								<h1 className="text-2xl font-bold text-[var(--yp-text-primary)] flex items-center gap-2">
									{property?.property_name}
								</h1>

								{/* Verification Icon */}
								{matchPermissions(
									authUser?.permissions,
									"Read Property Verification",
								) ? (
									<Link
										to={`/dashboard/property/${property?._id}/verification`}
										title="Verification"
									>
										{property?.verified ? (
											<BiSolidCheckShield className="text-green-500 text-2xl font-bold" />
										) : (
											<BiSolidShieldX className="text-red-500 text-2xl font-bold" />
										)}
									</Link>
								) : (
									<div>
										{property?.verified ? (
											<BiSolidCheckShield className="text-green-500 text-2xl font-bold" />
										) : (
											<BiSolidShieldX className="text-red-500 text-2xl font-bold" />
										)}
									</div>
								)}
							</div>

							<p className="text-[var(--yp-muted)]">
								{getCategoryById(property?.category || "")}
							</p>

							{location && (
								<p className="text-[var(--yp-muted)] text-xs mt-1">
									{[
										location.property_city,
										location.property_state,
										location.property_country,
									]
										.filter(Boolean)
										.join(", ")}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Property Website Link — bottom-right */}
				{property?.property_slug && (
					<a
						href={`${import.meta.env.VITE_MAIN_URL}/${generateSlug(
							getCategoryById(property?.academic_type ?? "") || "",
						)}/${generateSlug(property.property_slug || "")}/overview`}
						target="_blank"
						rel="noopener noreferrer"
						title="View on Website"
						className="absolute bottom-4 right-4 text-[var(--yp-muted)] hover:text-[var(--yp-accent)] transition flex items-center gap-1 text-sm"
					>
						<span>View on Website</span>
						<ExternalLink className="w-4 h-4" />
					</a>
				)}
			</div>

			<PropertyTabs
				tabs={tabs?.filter((item) => !item?.online)}
				showNav={authUser?.role !== "Property Manager"}
			/>
		</div>
	);
}
