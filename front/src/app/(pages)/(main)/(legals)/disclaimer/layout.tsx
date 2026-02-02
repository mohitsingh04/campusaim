import Loading from "@/ui/loader/Loading";
import { Metadata } from "next";
import { ReactNode, Suspense } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.campusaim.com";

export const metadata: Metadata = {
	title: "Disclaimer",
	description:
		"Our Disclaimer outlines content accuracy, informational limitations, and user responsibility when making academic or career decisions.",
	keywords: ["Disclaimer"],
	metadataBase: new URL(baseUrl),
	alternates: {
		canonical: "/disclaimer",
	},
};

export default function LegalLayout({ children }: { children: ReactNode }) {
	return <Suspense fallback={<Loading />}>{children}</Suspense>;
}
