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

const title = "Campusaim";
const desc =
  "Discover verified colleges and universities, explore accredited courses, and make informed academic decisions with trusted admission insights—tailored to your goals.";
const featuredImage = [
  {
    url: "/img/main-images/campusaim-default.png",
    width: 1200,
    height: 700,
    alt: "Campusaim",
  },
];
export const metadata: Metadata = {
  title: {
    default: title,
    template: `%s - ${title}`,
  },
  description: desc,
  metadataBase: new URL(baseUrl),
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/img/logo/favicon.ico", type: "image/png" }],
    shortcut: "/img/logo/favicon.ico",
    apple: "/img/logo/favicon.ico",
  },
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
