import API from "@/context/API";
import "@/css/Blogs.css";
import { Metadata } from "next";
import { getErrorResponse } from "@/context/Callbacks";
import LegalNotFound from "../_legalComponents/LegalNotFound";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const title = "Cancellation Policy";
const keywords = ["cancellation policy", "campusaim Cancellation Policy"];
const description =
  "View Campusaim cancellation and refund policy for admissions services, consultations, subscriptions, and other platform-related payments.";
const canonical = "/cancellation-policy";
const featuredImage = [
  {
    url: "/img/main-images/campusaim.png",
    width: 1200,
    height: 700,
    alt: "Cancellation Policy Campusaim",
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

const CancellationPolicy = async () => {
  let cancellation = null;

  try {
    const response = await API.get(`/legal`, {
      headers: { origin: BASE_URL },
    });
    cancellation = response.data.cancelation_policy?.content;
  } catch (error) {
    getErrorResponse(error, true);
  }

  return (
    <div className="bg-(--secondary-bg) min-h-screen">
      {cancellation ? (
        <div
          id="blog-main"
          className="px-4 sm:px-6 lg:px-8 py-8 text-(--text-color)!"
          dangerouslySetInnerHTML={{ __html: cancellation }}
        />
      ) : (
        <LegalNotFound />
      )}
    </div>
  );
};

export default CancellationPolicy;
