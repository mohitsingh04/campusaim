import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import "@/css/Blogs.css";
import { Metadata } from "next";
import LegalNotFound from "../_legalComponents/LegalNotFound";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.campusaim.com";

const title = "Disclaimer";
const keywords = ["Campusaim Disclaimer"];
const description =
  "Campusaim’s Disclaimer explains our content accuracy, yoga guidance limitations, and user responsibility for personal decisions.";
const canonical = "/disclaimer";
const featuredImage = [
  {
    url: "/img/main-images/campusaim.png",
    width: 1200,
    height: 700,
    alt: "Disclaimer Campusaim",
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

const Disclaimers = async () => {
  let disclaimer = null;

  try {
    const response = await API.get(`/legal`, {
      headers: { origin: BASE_URL },
    });
    disclaimer = response.data.disclaimer?.content;
  } catch (error) {
    getErrorResponse(error, true);
  }

  return (
    <div className="bg-(--secondary-bg)">
      {disclaimer ? (
        <div
          id="blog-main"
          className="px-4 sm:px-6 lg:px-8 py-8 text-(--text-color)!"
          dangerouslySetInnerHTML={{ __html: disclaimer }}
        />
      ) : (
        <LegalNotFound />
      )}
    </div>
  );
};

export default Disclaimers;
