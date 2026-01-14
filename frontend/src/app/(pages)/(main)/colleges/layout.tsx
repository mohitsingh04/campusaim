import PropertiesLoader from "@/components/Loader/Property/PropertiesLoader";
import { Metadata } from "next";
import { ReactNode, Suspense } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.campusaim.com";

export const metadata: Metadata = {
  title: "Colleges",
  description:
    "Discover top Yoga Institutes worldwide. Find, compare, and explore the best yoga institutes near you for authentic training and certification.",
  keywords: [
    "Yoga Studio",
    "University",
    "Colleges",
    "Online Yoga Studio",
    "Yoga Insititues",
  ],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/yoga-institutes",
  },
};

export default function PropertyLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PropertiesLoader />}>{children}</Suspense>;
}
