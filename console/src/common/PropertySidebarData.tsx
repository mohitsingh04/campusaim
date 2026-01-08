import {
	BadgeDollarSign,
	BarChart2,
	Bed,
	BookOpen,
	Eye,
	FileText,
	Gift,
	GraduationCap,
	Handshake,
	HelpCircle,
	Home,
	Image,
	ListChecks,
	Map,
	MapPin,
	Medal,
	Megaphone,
	MessageCircle,
	Users,
} from "lucide-react";
import { PropertyProps } from "../types/types";

export const PropertySidebarData = (
	selectedProperty: PropertyProps | null,
	isOnline = false
) => {
	const data = [
		{ name: "Dashboard", href: "/dashboard", icon: Home, online: false },
		{
			name: "Analytics",
			href: `/dashboard/property/${selectedProperty?._id}/analytics`,
			icon: BarChart2,
			online: false,
		},
		{
			name: "Enquiry",
			href: `/dashboard/property/${selectedProperty?._id}?tab=enquiry`,
			icon: Map,
			online: false,
		},
		{
			name: "Basic Details",
			href: `/dashboard/property/${selectedProperty?._id}?tab=basic-details`,
			icon: BookOpen,
			online: false,
		},
		{
			name: "Location",
			href: `/dashboard/property/${selectedProperty?._id}?tab=location`,
			icon: MapPin,
			online: isOnline,
		},
		{
			name: "Gallery",
			href: `/dashboard/property/${selectedProperty?._id}?tab=gallery`,
			icon: Image,
			online: false,
		},
		{
			name: "Course",
			href: `/dashboard/property/${selectedProperty?._id}?tab=course`,
			icon: ListChecks,
			online: false,
		},
		{
			name: "Review",
			href: `/dashboard/property/${selectedProperty?._id}?tab=review`,
			icon: HelpCircle,
			online: false,
		},
		{
			name: "FAQs",
			href: `/dashboard/property/${selectedProperty?._id}?tab=faqs`,
			icon: FileText,
			online: false,
		},
		{
			name: "SEO",
			href: `/dashboard/property/${selectedProperty?._id}?tab=seo`,
			icon: Eye,
			online: false,
		},
		{
			name: "Faculty",
			href: `/dashboard/property/${selectedProperty?._id}?tab=teachers`,
			icon: Users,
			online: false,
		},
		{
			name: "Accomodation",
			href: `/dashboard/property/${selectedProperty?._id}?tab=accomodation`,
			icon: Bed,
			online: isOnline,
		},
		{
			name: "Amenities",
			href: `/dashboard/property/${selectedProperty?._id}?tab=amenities`,
			icon: Gift,
			online: isOnline,
		},
		{
			name: "Scholarship",
			href: `/dashboard/property/${selectedProperty?._id}?tab=scholarship`,
			icon: BadgeDollarSign,
			online: isOnline,
		},
		{
			name: "Admission Process",
			href: `/dashboard/property/${selectedProperty?._id}?tab=admission_process`,
			icon: GraduationCap,
			online: isOnline,
		},
		{
			name: "Announcement",
			href: `/dashboard/property/${selectedProperty?._id}?tab=announcement`,
			icon: Megaphone,
			online: isOnline,
		},
		{
			name: "Loan Process",
			href: `/dashboard/property/${selectedProperty?._id}?tab=loan_process`,
			icon: Handshake,
			online: isOnline,
		},
		{
			name: "QnA",
			href: `/dashboard/property/${selectedProperty?._id}?tab=qna`,
			icon: MessageCircle,
			online: isOnline,
		},
		{
			name: "Ranking",
			href: `/dashboard/property/${selectedProperty?._id}?tab=ranking`,
			icon: Medal,
			online: isOnline,
		},
	];

	return data || [];
};
