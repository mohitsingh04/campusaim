import InsitutesLoader from "@/ui/loader/page/institutes/Institutes";
import { Metadata } from "next";
import { ReactNode, Suspense } from "react";

const title = "Entrance Exams Details";
const keywords = ["entrance exams", "competitive exams", "admission exams"];
const description =
  "Explore top entrance exams in India with exam dates, eligibility, syllabus, application process, admit card, results, and preparation details at Campusaim.";
const featuredImage = [
  {
    url: "/img/main-images/campusaim.png",
    width: 1200,
    height: 700,
    alt: "Exams Campusaim",
  },
];
export const metadata: Metadata = {
  title: title,
  description: description,
  keywords: keywords,
  alternates: {
    canonical: "/exams",
  },
  openGraph: {
    title: title,
    description: description,
    url: "/exams",
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
