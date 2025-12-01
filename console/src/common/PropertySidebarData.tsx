import {
  Award,
  BarChart2,
  Bed,
  BookOpen,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  Gift,
  HelpCircle,
  Home,
  Image,
  ListChecks,
  ListFilter,
  Map,
  MapPin,
  Tag,
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
      name: "Working Hours",
      href: `/dashboard/property/${selectedProperty?._id}?tab=working_hours`,
      icon: Clock,
      online: isOnline,
    },
    {
      name: "Teachers",
      href: `/dashboard/property/${selectedProperty?._id}?tab=teachers`,
      icon: Users,
      online: false,
    },
    {
      name: "Course",
      href: `/dashboard/property/${selectedProperty?._id}?tab=course`,
      icon: ListChecks,
      online: false,
    },
    {
      name: "Retreat",
      href: `/dashboard/property/${selectedProperty?._id}?tab=retreat`,
      icon: ListFilter,
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
      name: "Gallery",
      href: `/dashboard/property/${selectedProperty?._id}?tab=gallery`,
      icon: Image,
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
      name: "Certifications",
      href: `/dashboard/property/${selectedProperty?._id}?tab=certifications`,
      icon: Award,
      online: false,
    },
    {
      name: "SEO",
      href: `/dashboard/property/${selectedProperty?._id}?tab=seo`,
      icon: Eye,
      online: false,
    },
    {
      name: "Hiring",
      href: `/dashboard/property/${selectedProperty?._id}?tab=hiring`,
      icon: Users,
      online: false,
    },
    {
      name: "Applications",
      href: `/dashboard/property/${selectedProperty?._id}?tab=job-applications`,
      icon: ClipboardList,
      online: false,
    },
    {
      name: "Coupons",
      href: `/dashboard/property/${selectedProperty?._id}?tab=coupons`,
      icon: Tag,
      online: false,
    },
  ];

  return data || [];
};
