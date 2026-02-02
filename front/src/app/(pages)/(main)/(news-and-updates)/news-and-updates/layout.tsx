import NewsListSkeleton from "@/ui/loader/page/news-and-updates/NewslistSkeleton";
import { Metadata } from "next";
import { ReactNode, Suspense } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.campusaim.com";

export const metadata: Metadata = {
	title: "News and Updates",
	description:
		"Stay informed with the latest news and updates from colleges, universities, and the education sector. Explore announcements, trends, and important developments.",
	keywords: [
		"Education News",
		"College News",
		"University Updates",
		"Higher Education News",
		"Campus Updates",
	],
	metadataBase: new URL(baseUrl),
	alternates: {
		canonical: "/news-and-updates",
	},
};

export default function NewsLayout({ children }: { children: ReactNode }) {
	return <Suspense fallback={<NewsListSkeleton />}>{children}</Suspense>;
}
