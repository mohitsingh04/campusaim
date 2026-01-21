import Loading from "@/ui/loader/Loading";
import { Metadata } from "next";
import { ReactNode, Suspense } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.yogprerna.com";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Yogprerna’s Disclaimer explains our content accuracy, yoga guidance limitations, and user responsibility for personal decisions.",
  keywords: ["Disclaimer"],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/disclaimer",
  },
};

export default function LegalLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}
