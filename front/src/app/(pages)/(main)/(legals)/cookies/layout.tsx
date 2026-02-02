import { Metadata } from "next";
import { ReactNode, Suspense } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.campusaim.com";

export const metadata: Metadata = {
  title: "Cookies",
  description:
    "Campusaim uses cookies to enhance your experience, analyze site traffic, and improve performance. Learn how we use and manage cookies responsibly.",
  keywords: ["Cookies"],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/cookies",
  },
};
export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
