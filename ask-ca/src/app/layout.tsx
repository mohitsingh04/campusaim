import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "react-phone-input-2/lib/style.css";
import QueryProvider from "@/providers/QueryProvider";
import ScrollToTop from "@/components/common/ScrollToTop/ScrollToTop";

export const metadata: Metadata = {
	title: "Campusaim | Ask",
	description: "Ask & Answer app migrated to Next.js 🚀",
	other: {
		"google-site-verification": "u-7WuByrsvpZvsDLgdGdLyaKn1Yzorywb8kBZUf_KFo",
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<head>
			</head>
			<body>
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
