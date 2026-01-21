import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { AxiosError } from "axios";
import { Metadata } from "next";
import TrafficTracker from "./_property_components/TrafficTracker";
import API from "@/context/API";
import {
  extractKeywords,
  getErrorResponse,
  mergeCourseData,
  stripHtml,
} from "@/context/Callbacks";
import {
  PropertyCourseProps,
  PropertyProps,
  PropertyRankProps,
  PropertyReviewProps,
  PropertySeoProps,
} from "@/types/PropertyTypes";
import { CategoryProps, CourseProps } from "@/types/Types";
import PropertyDetailCard from "./_property_components/PropertyDetailCard";
import EnquiryForm from "./_property_components/Enquiry";
import RelatedInstitute from "./_property_components/RelatedInstitutes";
import InstituteDetailLoader from "@/ui/loader/page/institutes/InstituteDetail";

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
    getErrorResponse(error, true);
  }

  if (property?.uniqueId) {
    try {
      const seoRes = await API.get(`/property/seo/property/${property._id}`, {
        headers: { origin: BASE_URL },
      });
      seo = seoRes.data;
    } catch (error) {
      getErrorResponse(error, true);
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
      getErrorResponse(error, true);
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
    let loading = true;
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
    let rankData: PropertyRankProps = {};
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

    let seoData: PropertySeoProps = {};
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

    let reviewData: PropertyReviewProps[] = [];
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
    let coursesData: PropertyCourseProps[] = [];
    let mainCoursesData: CourseProps[] = [];
    try {
      const courseRes = await API.get(`/course`, {
        headers: { origin: BASE_URL },
      });
      mainCoursesData = courseRes?.data || {};
    } catch (err) {
      if (err instanceof AxiosError) {
        mainCoursesData = [];
      } else {
        throw err;
      }
    }
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

    const mergedCourses: PropertyCourseProps[] = mergeCourseData(
      coursesData,
      mainCoursesData
    ) as unknown as PropertyCourseProps[];

    // Merge property with category + location + rank
    const mainProperty: PropertyProps = {
      ...property,
      category: getCategoryById(property?.category),
      category_id: property?.category,
      property_address: locationData?.property_address || null,
      property_pincode: locationData?.property_pincode || null,
      property_city: locationData?.property_city || null,
      property_state: locationData?.property_state || null,
      property_country: locationData?.property_country || null,
      rank: rankData?.rank || 0,
      lastRank: rankData?.lastRank || 0,
      reviews: reviewData,
      courses: mergedCourses,
    };

    loading = false;

    if (loading) return <InstituteDetailLoader />;

    return (
      <div className="min-h-screen bg-(--secondary-bg) pb-6">
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
                  <RelatedInstitute
                    property={mainProperty}
                    category={categoryRes?.data}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
        {seoData?.json_schema && (
          <div dangerouslySetInnerHTML={{ __html: seoData?.json_schema }} />
        )}
      </div>
    );
  } catch (error) {
    getErrorResponse(error, true);
    return notFound();
  }
}
