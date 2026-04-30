import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import Script from "next/script";
import { ToastContainer } from "react-toastify";
import "../css/globals.css";
import Providers from "@/context/providers/Provider";

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

const title =
  "Campusaim - Find Best Colleges, Universities, Schools & Academies in India";
const desc =
  "Discover top colleges, universities, schools & academies in India. Compare courses, fees & locations easily with the Campusaim platform.";
const featuredImage = [
  {
    url: "/img/main-images/campusaim.png",
    width: 1200,
    height: 700,
    alt: "Campusaim",
  },
];
const ICON = [{ url: "/img/logo/favicon.ico", type: "image/png" }];
export const metadata: Metadata = {
  title: {
    default: title,
    template: `%s - Campusaim`,
  },
  description: desc,
  metadataBase: new URL(baseUrl),
  alternates: { canonical: "/" },
  icons: { icon: ICON, shortcut: ICON, apple: ICON },
  openGraph: {
    title: title,
    description: desc,
    url: "/",
    siteName: "Campusaim",
    images: featuredImage,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    description: desc,
    images: featuredImage,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body className={`${montserrat.variable} ${poppins.variable}`}>
        <noscript></noscript>
        <ToastContainer />
        <Providers>{children}</Providers>
        <Script
          src="https://kit.fontawesome.com/87f0afa689.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
