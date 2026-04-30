import InsitutesLoader from "@/ui/loader/page/institutes/Institutes";
import { Metadata } from "next";
import { Suspense } from "react";
import InstitutesPage from "./InstitutesPage";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://campusaim.com";

const title = "Institutes";
const keywords = ["University", "Colleges", "School", "Coaching"];
const description =
  "Discover top Institutes in India. Find, compare, and explore the best institutes near you for certification.";
const canonical = "/institutes";
const featuredImage = [
  {
    url: "/img/main-images/campusaim.png",
    width: 1200,
    height: 700,
    alt: "Institutes",
  },
];
export const metadata: Metadata = {
  title: title,
  description: description,
  keywords: keywords,
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: canonical,
  },
  openGraph: {
    title: title,
    description: description,
    url: canonical,
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

export default function YogaInsitutesPage() {
  return (
    <Suspense fallback={<InsitutesLoader />}>
      <InstitutesPage />
    </Suspense>
  );
}
