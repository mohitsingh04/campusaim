import InsitutesLoader from "@/ui/loader/page/institutes/Institutes";
import { Metadata } from "next";
import { ReactNode, Suspense } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.yogprerna.com";

export const metadata: Metadata = {
  title: "Yoga Institutes",
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
  return <Suspense fallback={<InsitutesLoader />}>{children}</Suspense>;
}
