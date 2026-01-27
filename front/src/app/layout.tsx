import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/hooks/useTheme";
import { ToastContainer } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SkeletonTheme } from "react-loading-skeleton";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

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
    "Discover verified colleges and universities, explore accredited courses, and make informed academic decisions with trusted admission insights—tailored to your goals.",
  keywords: [
    "college",
    "university",
  ],
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
    <html lang="en">
      <head>
      </head>
      <body className={`${montserrat.variable} ${poppins.variable}`}>
        <noscript>
        </noscript>
        <ToastContainer />
        <ThemeProvider>
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
          >
            <SkeletonTheme
              baseColor={"var(--secondary-bg)"}
              highlightColor={"var(--primary-bg"}
            >
              {children}
            </SkeletonTheme>
          </GoogleOAuthProvider>
        </ThemeProvider>
        <Script
          src="https://kit.fontawesome.com/87f0afa689.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
