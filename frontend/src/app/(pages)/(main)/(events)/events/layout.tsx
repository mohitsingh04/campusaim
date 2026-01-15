import PropertiesLoader from "@/components/Loader/Property/PropertiesLoader";
import { Metadata } from "next";
import { ReactNode, Suspense } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://campusaim.com";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Stay updated with upcoming yoga events, retreats, and workshops near you. Never miss a yoga event that inspires your growth.",
  keywords: ["Yoga Events"],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/events",
  },
};

export default function EventLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PropertiesLoader />}>{children}</Suspense>;
}
