import PropertiesLoader from "@/components/Loader/Property/PropertiesLoader";
import { Metadata } from "next";
import { ReactNode, Suspense } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.yogprerna.com";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Discover yoga courses for all levels — beginner to expert. Learn online or offline with certified yoga training and teacher programs.",
  keywords: ["Courses", "Yoga Courses"],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/courses",
  },
};

export default function CoursesLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PropertiesLoader />}>{children}</Suspense>;
}
