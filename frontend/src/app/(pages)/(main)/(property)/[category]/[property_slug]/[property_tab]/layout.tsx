import { ReactNode } from "react";
import API from "@/contexts/API";
import { notFound } from "next/navigation";
import { AxiosError } from "axios";
import PropertyDetailCard from "./_property_components/PropertyCard";
import RelatedInstitutes from "./_property_components/RelatedInstitutes";
import {
  CategoryProps,
  CourseProps,
  PropertyProps,
  RankProps,
  ReviewProps,
  SeoProps,
} from "@/types/types";
import EnquiryForm from "./_property_components/EnquiryForm";
import TrafficTracker from "./TrafficTracker";
import { Metadata } from "next";
import { extractKeywords, stripHtml } from "@/contexts/Callbacks";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    property_slug: string;
    category: string;
    property_tab: string;
  }>;
}): Promise<Metadata> {
  const { property_slug, category, property_tab } = await params;
  let property = null;
  let location = null;
  let seo = null;

  try {
    const res = await API.get(`/property/slug/${property_slug}`, {
      headers: { origin: BASE_URL },
    });
    property = res.data;
  } catch (error) {
    const err = error as AxiosError<{ error: string }>;
    console.log(err.response?.data.error);
    if (err?.response?.data?.error === "Property not found.") {
      notFound();
    }
  }

  if (property?.uniqueId) {
    try {
      const seoRes = await API.get(`/property/seo/property/${property._id}`, {
        headers: { origin: BASE_URL },
      });
      seo = seoRes.data;
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      console.error("Error loading SEO:", err.response?.data.error);
    }
  }
  if (property?.uniqueId) {
    try {
      const locationRes = await API.get(
        `/property/location/${property.uniqueId}`,
        {
          headers: { origin: BASE_URL },
        }
      );
      location = locationRes.data;
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      console.error("Error loading SEO:", err.response?.data.error);
    }
  }

  if (!property) {
    return { title: "Property Not Found" };
  }

  const keywords = extractKeywords(seo?.primary_focus_keyword);

  return {
    title: location?.property_city
      ? `${property?.property_name} ${location?.property_city}`
      : property.property_name,
    description:
      stripHtml(seo?.meta_description, 160) ||
      stripHtml(property?.property_description, 160) ||
      "Discover a peaceful yoga Studio with expert instructors, calming ambience, and classes for all levels. Reconnect your mind, body, and soul.",
    keywords,
    alternates: {
      canonical: `${BASE_URL}/${category}/${property.property_slug}/${property_tab}`,
    },
    openGraph: {
      title: location?.property_city
        ? `${property?.property_name} ${location?.property_city}`
        : property.property_name,
      description:
        stripHtml(seo?.meta_description, 160) ||
        stripHtml(property?.property_description, 160) ||
        "Discover a peaceful yoga Studio with expert instructors, calming ambience, and classes for all levels. Reconnect your mind, body, and soul.",
      images: property.featured_image?.[0]
        ? [
            {
              url: `${MEDIA_URL}/${property.featured_image[0]}`,
              alt: property.property_name || "Property Image",
            },
          ]
        : undefined,
    },
  };
}

export default async function PropertyLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ property_slug: string }>;
}) {
  try {
    const { property_slug } = await params;

    const categoryRes = await API.get("/category", {
      headers: { origin: BASE_URL },
    });

    const propertyRes = await API.get(`/property/slug/${property_slug}`, {
      headers: { origin: BASE_URL },
    });

    const property: PropertyProps | null = propertyRes?.data || null;
    if (!property) {
      return notFound();
    }

    let locationData: any = {};
    if (property?.uniqueId) {
      try {
        const locationRes = await API.get(
          `/property/location/${property.uniqueId}`,
          { headers: { origin: BASE_URL } }
        );
        locationData = locationRes?.data || {};
      } catch (err) {
        if (err instanceof AxiosError) {
          // Location not found, leave empty
          locationData = {};
        } else {
          throw err;
        }
      }
    }

    // Fetch rank safely
    let rankData: RankProps = {};
    if (property?.uniqueId) {
      try {
        const rankRes = await API.get(`/property/rank/${property._id}`, {
          headers: { origin: BASE_URL },
        });
        rankData = rankRes?.data || {};
      } catch (err) {
        if (err instanceof AxiosError) {
          rankData = {};
        } else {
          throw err;
        }
      }
    }

    let seoData: SeoProps = {};
    if (property?.uniqueId) {
      try {
        const seoRes = await API.get(`/property/seo/property/${property._id}`, {
          headers: { origin: BASE_URL },
        });
        seoData = seoRes?.data || {};
      } catch (err) {
        if (err instanceof AxiosError) {
          seoData = {};
        } else {
          throw err;
        }
      }
    }

    let reviewData: ReviewProps[] = [];
    if (property?.uniqueId) {
      try {
        const reviewRes = await API.get(
          `/review/property/${property.uniqueId}`,
          {
            headers: { origin: BASE_URL },
          }
        );
        reviewData = reviewRes?.data || {};
      } catch (err) {
        if (err instanceof AxiosError) {
          reviewData = [];
        } else {
          throw err;
        }
      }
    }
    let coursesData: CourseProps[] = [];
    if (property?._id) {
      try {
        const courseRes = await API.get(
          `/property/property-course/${property._id}`,
          {
            headers: { origin: BASE_URL },
          }
        );
        coursesData = courseRes?.data || {};
      } catch (err) {
        if (err instanceof AxiosError) {
          coursesData = [];
        } else {
          throw err;
        }
      }
    }

    const getCategoryById = (id: string | number) => {
      const cat = categoryRes?.data?.find(
        (item: CategoryProps) => Number(item?.uniqueId) === Number(id)
      );
      return cat?.category_name;
    };

    // Merge property with category + location + rank
    const mainProperty: PropertyProps = {
      ...property,
      category: getCategoryById(property?.category),
      property_address: locationData?.property_address || null,
      property_pincode: locationData?.property_pincode || null,
      property_city: locationData?.property_city || null,
      property_state: locationData?.property_state || null,
      property_country: locationData?.property_country || null,
      rank: rankData?.rank || 0,
      lastRank: rankData?.lastRank || 0,
      reviews: reviewData,
      courses: coursesData,
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-0 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <PropertyDetailCard property={mainProperty} />
                <TrafficTracker propertyId={mainProperty._id} />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-0">
              {children}
              <EnquiryForm property={mainProperty} />
              <RelatedInstitutes
                mainProperty={mainProperty}
                category={categoryRes?.data}
              />
            </div>
          </div>
        </main>
        {seoData?.json_schema && (
          <div dangerouslySetInnerHTML={{ __html: seoData?.json_schema }} />
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading property layout:", error);

    if (error instanceof AxiosError) {
      console.error("API error:", error.response?.data || error.message);
    }

    return notFound();
  }
}
