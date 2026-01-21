import BlogListSkeleton from "@/ui/loader/page/blog/BlogListSkeleton";
import { Metadata } from "next";
import { ReactNode, Suspense } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.yogprerna.com";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read our latest yoga blog for tips, poses, wellness guides, and inspiration to deepen your yoga journey every day.",
  keywords: ["Yoga Blog", "Blog"],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<BlogListSkeleton />}>{children}</Suspense>;
}
