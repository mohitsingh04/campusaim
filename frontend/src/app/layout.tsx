import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import { Toaster } from "react-hot-toast";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";

import "react-loading-skeleton/dist/skeleton.css";
import "react-phone-input-2/lib/style.css";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import UnderConstructionToast from "@/components/Nofitications/UnderConstructionToast";
import { GoogleOAuthProvider } from "@react-oauth/google";

const poppins = Poppins({
	variable: "--font-poppins",
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://campusaim.com";

export const metadata: Metadata = {
	title: {
		default: "Campusaim",
		template: "%s - Campusaim",
	},
	description:
		"Find colleges and universities by course, location, and eligibility. Campusaim helps students make informed academic decisions with reliable data.",
	keywords: ["Campusaim", "Colleges", "Universities", "Education"],
	metadataBase: new URL(baseUrl),
	alternates: {
		canonical: "/",
	},
	icons: {
		icon: [
			{
				url: "/img/logo/favicon.ico",
				type: "image/ico",
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={poppins.variable}>
			<head></head>
			<body className="antialiased">
				<Toaster position="top-right" />
				<UnderConstructionToast />
				<GoogleOAuthProvider
					clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
				>
					{children}
				</GoogleOAuthProvider>

				<Script
					src="https://kit.fontawesome.com/87f0afa689.js"
					crossOrigin="anonymous"
					strategy="afterInteractive"
				/>
			</body>
		</html>
	);
}
