import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "react-phone-input-2/lib/style.css";
import Script from "next/script";
import QueryProvider from "@/providers/QueryProvider";
import ScrollToTop from "@/components/common/ScrollToTop/ScrollToTop";

export const metadata: Metadata = {
	title: "Ask | YogPrerna",
	description: "Ask & Answer app migrated to Next.js 🚀",
	other: {
		"google-site-verification": "u-7WuByrsvpZvsDLgdGdLyaKn1Yzorywb8kBZUf_KFo",
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<head>
				{/* <!-- Google Tag Manager --> */}
				<Script
					id="gtm-head"
					strategy="afterInteractive"
					dangerouslySetInnerHTML={{
						__html: `
							(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
							new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
							j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
							'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
							})(window,document,'script','dataLayer','GTM-KQQGF994');
						`,
					}}
				/>
				{/* <!-- End Google Tag Manager --> */}
			</head>
			<body>
				{/* <!-- Google Tag Manager (noscript) --> */}
				<noscript>
					<iframe
						src="https://www.googletagmanager.com/ns.html?id=GTM-KQQGF994"
						height="0"
						width="0"
					></iframe>
				</noscript>
				{/* <!-- End Google Tag Manager (noscript) --> */}
				<Toaster />
				<ScrollToTop />
				<QueryProvider>
					<AuthProvider>
						<GoogleOAuthProvider
							clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
						>
							{children}
						</GoogleOAuthProvider>
					</AuthProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
