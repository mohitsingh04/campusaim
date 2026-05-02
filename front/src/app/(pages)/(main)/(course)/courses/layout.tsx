import InsitutesLoader from "@/ui/loader/page/institutes/Institutes";
import { Metadata } from "next";
import { ReactNode, Suspense } from "react";

const title = "Top College & University Courses";
const keywords = [
  "college courses",
  "university courses",
  "top courses after 12th",
  "UG courses",
  "PG courses",
  "diploma courses",
  "online courses",
];
const description =
  "Explore top college and university courses at CampusAim. Compare fees, eligibility, admissions, duration, careers, and specialisations in one place online today.";
const featuredImage = [
  {
    url: "/img/main-images/campusaim.png",
    width: 1200,
    height: 700,
    alt: "Courses Yogprerna",
  },
];
export const metadata: Metadata = {
  title: title,
  description: description,
  keywords: keywords,
  alternates: {
    canonical: "/courses",
  },
  openGraph: {
    title: title,
    description: description,
    url: "/courses",
    siteName: "Campusaim",
    images: featuredImage,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
    images: featuredImage,
  },
};

export default function CoursesLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<InsitutesLoader />}>{children}</Suspense>;
}
