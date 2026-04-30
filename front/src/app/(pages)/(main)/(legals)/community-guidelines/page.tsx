import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import "@/css/Blogs.css";
import { Metadata } from "next";
import LegalNotFound from "../_legalComponents/LegalNotFound";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.campusaim.com";

const title = "Commuinty Guidelines";
const keywords = [
  "Campusaim Community Guidelines",
  "online community standards",
];
const description =
  "Read our Community Guidelines to ensure a safe, respectful, and positive environment. Learn the rules, user responsibilities, and content standards. Visit Us";
const canonical = "/community-guidelines";
const featuredImage = [
  {
    url: "/img/main-images/campusaim.png",
    width: 1200,
    height: 700,
    alt: "Community Guidelines Campusaim",
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

const CommuintyGuidlinesPolicy = async () => {
  let commuiltyGuide = null;

  try {
    const response = await API.get(`/legal`, {
      headers: { origin: BASE_URL },
    });
    commuiltyGuide = response?.data?.community_guidlines?.content;
  } catch (error) {
    getErrorResponse(error, true);
  }

  return (
    <div className="bg-(--secondary-bg)">
      {commuiltyGuide ? (
        <div
          id="blog-main"
          className="px-4 sm:px-6 lg:px-8 py-8 text-(--text-color)!"
          dangerouslySetInnerHTML={{ __html: commuiltyGuide }}
        />
      ) : (
        <LegalNotFound />
      )}
    </div>
  );
};

export default CommuintyGuidlinesPolicy;
