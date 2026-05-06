import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import "@/css/Blogs.css";
import { Metadata } from "next";
import LegalNotFound from "../_legalComponents/LegalNotFound";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const title = "Privacy Policy";
const keywords = ["privacy policy", "campusaim privacy policy"];
const description =
  "Learn how Campusaim collects, stores, protects, and uses your personal information while ensuring privacy, security, and transparency online.";
const canonical = "/privacy-policy";
const featuredImage = [
  {
    url: "/img/main-images/campusaim.png",
    width: 1200,
    height: 700,
    alt: "Privacy Policy",
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

const PrivacyPolicy = async () => {
  let privacy = null;

  try {
    const response = await API.get(`/legal`, {
      headers: { origin: BASE_URL },
    });
    privacy = response.data.privacy_policy?.content;
  } catch (error) {
    getErrorResponse(error, true);
  }

  return (
    <div className="bg-(--secondary-bg)">
      {privacy ? (
        <div
          id="blog-main"
          className="px-4 sm:px-6 lg:px-8 py-8 text-(--text-color)!"
          dangerouslySetInnerHTML={{ __html: privacy }}
        />
      ) : (
        <LegalNotFound />
      )}
    </div>
  );
};

export default PrivacyPolicy;
