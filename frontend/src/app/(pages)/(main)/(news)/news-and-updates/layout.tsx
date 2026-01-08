import PropertiesLoader from "@/components/Loader/Property/PropertiesLoader";
import { Metadata } from "next";
import { ReactNode, Suspense } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.campusaim.com";

export const metadata: Metadata = {
  title: "News & Updates",
  description:
    "Stay informed with the latest yoga news and updates. Get insights on new trends, research, and happenings in the world of yoga.",
  keywords: ["Yoga News", "News & Updates"],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/news-and-updates",
  },
};

export default function NewsLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PropertiesLoader />}>{children}</Suspense>;
}
