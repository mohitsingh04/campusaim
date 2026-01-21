import NewsListSkeleton from "@/ui/loader/page/news-and-updates/NewslistSkeleton";
import { Metadata } from "next";
import { ReactNode, Suspense } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.yogprerna.com";

export const metadata: Metadata = {
  title: "News and Updates",
  description:
    "Stay informed with the latest yoga news and updates. Get insights on new trends, research, and happenings in the world of yoga.",
  keywords: ["Yoga News", "News and Updates"],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/news-and-updates",
  },
};

export default function NewsLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<NewsListSkeleton />}>{children}</Suspense>;
}
