import { ReactNode, Suspense } from "react";
import { Metadata } from "next";
import ProfessionalLoader from "@/components/Loader/Professional/ProfessionalLoader";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.yogprerna.com";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Connect with certified yoga professionals at Yogprerna. Explore expert trainers, instructors, and wellness guides from around the world.",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/profile/professional",
  },
};

export default async function PropertyLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <Suspense fallback={<ProfessionalLoader />}>{children}</Suspense>;
}
