import React from "react";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import "@/css/Blogs.css";
import { Metadata } from "next";
import LegalNotFound from "../_legalComponents/LegalNotFound";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const title = "Terms and Conditions";
const keywords = ["terms and conditions", "campusaim terms and conditions"];
const description =
  "Read Campusaim terms and conditions regarding website usage, services, admissions guidance, user responsibilities, and platform policies.";
const canonical = "/terms-and-conditions";
const featuredImage = [
  {
    url: "/img/main-images/campusaim.png",
    width: 1200,
    height: 700,
    alt: "Terms and Conditions Campusaim",
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

const TermsAndConditions = async () => {
  let terms = null;

  try {
    const response = await API.get(`/legal`, {
      headers: { origin: BASE_URL },
    });
    terms = response.data.terms?.content;
  } catch (error) {
    getErrorResponse(error, true);
  }

  return (
    <div className="bg-(--secondary-bg)">
      {terms ? (
        <div
          id="blog-main"
          className="px-4 sm:px-6 lg:px-8 py-8 text-(--text-color)!"
          dangerouslySetInnerHTML={{ __html: terms }}
        />
      ) : (
        <LegalNotFound />
      )}
    </div>
  );
};

export default TermsAndConditions;
