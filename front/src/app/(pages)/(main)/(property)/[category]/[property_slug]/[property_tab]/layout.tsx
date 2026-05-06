import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import TrafficTracker from "./_property_components/TrafficTracker";
import { getErrorResponse, stripHtml } from "@/context/Callbacks";
import {
  PropertyLocationProps,
  PropertyProps,
  PropertySeoProps,
} from "@/types/PropertyTypes";
import PropertyDetailCard from "./_property_components/PropertyDetailCard";
import EnquiryForm from "./_property_components/Enquiry";
import RelatedInstitute from "./_property_components/RelatedInstitutes";
import InstituteDetailLoader from "@/ui/loader/page/institutes/InstituteDetail";
import {
  getPropertyBySlug,
  getPropertyCourseCount,
  getPropertyLocation,
  getPropertyRatingStats,
  getPropertySeo,
} from "@/lib/Fetch-Property";
import { PropertyProvider } from "@/context/providers/PropertyDetailsProvider";
import PropertyJsonSchemaHandler from "./_property_components/PropertyJsonSchemaHandler";

export const dynamic = "force-dynamic";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;

const DEFAULT_IMAGE = `${BASE_URL}/img/default-images/campusaim-featured.png`;

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
  const property: PropertyProps | null = await getPropertyBySlug(property_slug);
  if (!property) return notFound();
  let location: PropertyLocationProps | null = null;
  if (property?._id) location = await getPropertyLocation(property._id);
  let seo: PropertySeoProps | null = null;
  if (property?._id) seo = await getPropertySeo(property._id);

  const property_tab_capitalize =
    property_tab.charAt(0).toUpperCase() + property_tab.slice(1);

  const meta_title = location?.property_city
    ? `${property_tab_capitalize} | ${property?.property_name} ${location?.property_city}`
    : `${property_tab_capitalize} | ${property.property_name}`;

  const baseMetaDescription =
    stripHtml(seo?.meta_description || "", 160) ||
    stripHtml(property?.property_description, 160) ||
    `Explore ${property?.property_name} ${location?.property_city} ${property_tab?.replaceAll("-", " ")} including courses, fees, admission & ranking. Top ranking ${category} with top placements & facilities.`;
  const description = `${property_tab_capitalize} ${baseMetaDescription}`
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  const leadKeyword: string | undefined =
    property_tab === "overview"
      ? property?.property_name
      : `${property_tab_capitalize} ${property?.property_name}`;

  const secondary: string | undefined = (seo?.primary_focus_keyword || []).find(
    (k: string) => k !== property?.property_name,
  );
  const finalKeyword: string[] = [...new Set([leadKeyword, secondary])]
    .filter((k): k is string => Boolean(k))
    .slice(0, 2);

  const ogImage = property.featured_image?.[0]
    ? `${MEDIA_URL}/${property.featured_image[0]}`
    : DEFAULT_IMAGE;

  const canonical = `${BASE_URL}/${category}/${property.property_slug}/${property_tab}`;

  const featuredImage = [
    {
      url: ogImage,
      width: 1200,
      height: 700,
      alt: property.property_name || "Property Featured Image",
    },
  ];
  return {
    title: meta_title,
    description: description,
    keywords: finalKeyword,
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: meta_title,
      description: description,
      url: canonical,
      siteName: "Campusaim",
      images: featuredImage,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta_title,
      description: description,
      images: featuredImage,
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
    let loading = true;

    const property: PropertyProps | null =
      await getPropertyBySlug(property_slug);
    if (!property) return notFound();

    const heroImageSrc = property?.featured_image?.[0]
      ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${property.featured_image[0]}`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/img/default-images/yp-institutes.webp`;

    const [locationData, reviewData, courseCount]: [
      locationData: PropertyLocationProps | null,
      reviewData: any,
      courseCount: any,
    ] = await Promise.all([
      property._id ? getPropertyLocation(property._id) : null,
      property._id ? getPropertyRatingStats(property._id) : {},
      property._id ? getPropertyCourseCount(property._id) : { courses: 0 },
    ]);

    const mainProperty: PropertyProps = {
      ...property,
      property_address: locationData?.property_address || "",
      property_pincode: locationData?.property_pincode || "",
      property_city: locationData?.property_city || "",
      property_state: locationData?.property_state || "",
      property_country: locationData?.property_country || "",
      reviews: reviewData,
      average_rating: reviewData?.summary?.averageRating,
      total_reviews: reviewData?.summary?.totalReviews,
      courses_count: courseCount?.courses || 0,
    };
    loading = false;

    if (loading) return <InstituteDetailLoader />;

    return (
      <PropertyProvider property={mainProperty} location={locationData}>
        <PropertyJsonSchemaHandler
          property={mainProperty}
          property_slug={property_slug}
        />
        <div className="min-h-screen bg-(--secondary-bg) pb-6">
          <link
            rel="preload"
            as="image"
            href={heroImageSrc}
            fetchPriority="high"
          />
          <main className="mx-auto px-2 sm:px-8 py-0 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-1">
                <div className="sticky top-17">
                  <PropertyDetailCard property={mainProperty} />
                  <TrafficTracker propertyId={mainProperty._id} />
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="max-w-6xl mx-auto">
                  {children}

                  <div className="mt-6 flex flex-col gap-6">
                    <EnquiryForm property={mainProperty} />
                    <RelatedInstitute property={mainProperty} />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </PropertyProvider>
    );
  } catch (error) {
    getErrorResponse(error, true);
    return notFound();
  }
}
