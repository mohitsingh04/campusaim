import InsitutesLoader from "@/ui/loader/page/institutes/Institutes";
import { Metadata } from "next";
import { Suspense } from "react";
import InstitutesPage from "../InstitutesPage";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://campusaim.com";

const title = "Top Schools in India";
const keywords = ["top schools in india", "best schools list"];
const description =
  "Find the best schools in India. Explore CBSE, ICSE & state board schools with details on fees, facilities, admissions & reviews.";
const canonical = "/schools";
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

export default function SchoolsPage() {
  return (
    <Suspense fallback={<InsitutesLoader />}>
      <InstitutesPage pageCat="school" />
    </Suspense>
  );
}
