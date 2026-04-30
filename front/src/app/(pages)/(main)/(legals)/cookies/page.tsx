import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import "@/css/Blogs.css";
import { Metadata } from "next";
import LegalNotFound from "../_legalComponents/LegalNotFound";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.campusaim.com";

const title = "Cookies";
const keywords = ["Campusaim Cookies"];
const description =
  "Campusaim uses cookies to enhance your experience, analyze site traffic, and improve performance. Learn how we use and manage cookies responsibly.";
const canonical = "/cookies";
const featuredImage = [
  {
    url: "/img/main-images/campusaim.png",
    width: 1200,
    height: 700,
    alt: "Cookies Campusaim",
  },
];
export const metadata: Metadata = {
  title: title,
  description: description,
  keywords: keywords,
  alternates: {
    canonical: canonical,
  },
  openGraph: {
    title: title,
    description: description,
    url: canonical,
    siteName: "Campusaim",
    images: featuredImage,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
    images: featuredImage,
  },
};

const Cookies = async () => {
  let cookiesPolicy = null;

  try {
    const response = await API.get(`/legal`, {
      headers: { origin: BASE_URL },
    });
    cookiesPolicy = response.data.cookies?.content;
  } catch (error) {
    getErrorResponse(error, true);
  }

  return (
    <div className="bg-(--secondary-bg)">
      {cookiesPolicy ? (
        <div>
          <div
            id="blog-main"
            className="px-4 sm:px-6 lg:px-8 py-8 text-(--text-color)!"
            dangerouslySetInnerHTML={{ __html: cookiesPolicy }}
          />
        </div>
      ) : (
        <LegalNotFound />
      )}
    </div>
  );
};

export default Cookies;
