"use client";

import {
  BedIcon,
  BookOpenIcon,
  CircleHelpIcon,
  ImageIcon,
  InfoIcon,
  SettingsIcon,
  StarIcon,
  UsersIcon,
  GraduationCapIcon,
  ClipboardListIcon,
  HandCoinsIcon,
  MegaphoneIcon,
  TrophyIcon,
  MessageSquareQuoteIcon,
} from "lucide-react";
import { useMemo } from "react";
import { PropertyProps } from "@/types/PropertyTypes";
import dynamic from "next/dynamic";

const Overview = dynamic(() => import("./tabs/Overview"));
const CoursesTab = dynamic(() => import("./tabs/Courses"));
const GalleryTab = dynamic(() => import("./tabs/GalleryTab"));
const AccommodationTab = dynamic(() => import("./tabs/AccomodationTab"));
const AmenitiesTab = dynamic(() => import("./tabs/AmenitiesTab"));
const TeachersTab = dynamic(() => import("./tabs/TeachersTab"));
const FaqsTab = dynamic(() => import("./tabs/FaqsTab"));
const ReviewsTab = dynamic(() => import("./tabs/ReviewsTab"));
const ScholarshipTab = dynamic(() => import("./tabs/ScholarshipTab"));
const AdmissionProcessTab = dynamic(() => import("./tabs/AdmissionProcessTab"));
const LoanProcessTab = dynamic(() => import("./tabs/LoanProcessTab"));
const AnnouncementTab = dynamic(() => import("./tabs/AnnouncementTab"));
const RankingTab = dynamic(() => import("./tabs/RankingTab"));
const QnaTab = dynamic(() => import("./tabs/QnaTab"));

export const usePropertyTabsData = ({
  property,
  getCategoryById,
  tabexistence,
}: {
  property: PropertyProps | null;
  getCategoryById: (id: string) => string | undefined;
  tabexistence: any;
}) => {
  const tabs = useMemo(() => {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: InfoIcon,
        show: true,
        tab: <Overview property={property} getCategoryById={getCategoryById} />,
      },
      {
        id: "courses",
        label: "Courses",
        icon: BookOpenIcon,
        show: !!tabexistence?.courseTab,
        tab: (
          <CoursesTab property={property} getCategoryById={getCategoryById} />
        ),
      },
      {
        id: "gallery",
        label: "Gallery",
        icon: ImageIcon,
        show: !!tabexistence?.galleryTab,
        tab: <GalleryTab property={property} />,
      },
      {
        id: "hostel",
        label: "Hostel",
        icon: BedIcon,
        show: !!tabexistence?.accomodationTab,
        tab: <AccommodationTab property={property} />,
      },
      {
        id: "amenities",
        label: "Amenities",
        icon: SettingsIcon,
        show: !!tabexistence?.amenitiesTab,
        tab: <AmenitiesTab property={property} />,
      },
      {
        id: "scholarship",
        label: "Scholarship",
        icon: GraduationCapIcon,
        show: !!tabexistence?.scholarshipTab,
        tab: <ScholarshipTab property={property} />,
      },
      {
        id: "admission-process",
        label: "Admission Process",
        icon: ClipboardListIcon,
        show: !!tabexistence?.admissionProcessTab,
        tab: <AdmissionProcessTab property={property} />,
      },
      {
        id: "loan-process",
        label: "Loan Process",
        icon: HandCoinsIcon,
        show: !!tabexistence?.loadProcessTab,
        tab: <LoanProcessTab property={property} />,
      },
      {
        id: "announcements",
        label: "Announcements",
        icon: MegaphoneIcon,
        show: !!tabexistence?.announcementTab,
        tab: <AnnouncementTab property={property} />,
      },
      {
        id: "qna",
        label: "Q&A",
        icon: MessageSquareQuoteIcon,
        show: !!tabexistence?.qnaTab,
        tab: <QnaTab property={property} />,
      },
      {
        id: "ranking",
        label: "Ranking",
        icon: TrophyIcon,
        show: !!tabexistence?.RankingTabDocs,
        tab: (
          <RankingTab property={property} getCategoryById={getCategoryById} />
        ),
      },
      {
        id: "teachers",
        label: "Faculty",
        icon: UsersIcon,
        show: !!tabexistence?.teachersTab,
        tab: <TeachersTab property={property} />,
      },
      {
        id: "faq",
        label: "FAQ",
        icon: CircleHelpIcon,
        show: !!tabexistence?.faqTab,
        tab: <FaqsTab property={property} />,
      },
      {
        id: "reviews",
        label: "Reviews",
        icon: StarIcon,
        show: true,
        tab: <ReviewsTab property={property} />,
      },
    ];
  }, [property, getCategoryById, tabexistence]);

  return tabs;
};
