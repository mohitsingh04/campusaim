import API from "@/contexts/API";
import { generateSlug } from "@/contexts/Callbacks";
import { CategoryProps, PropertyProps } from "@/types/types";

// ---------------- Interfaces for API responses ----------------
interface Course {
  property_id: number;
  [key: string]: unknown;
}
interface Gallery {
  propertyId: number;
  [key: string]: unknown;
}
interface Accomodation {
  property_id: number;
  [key: string]: unknown;
}
interface Amenity {
  propertyId: number;
  [key: string]: unknown;
}
interface Certification {
  property_id: number;
  [key: string]: unknown;
}
interface BusinessHour {
  property_id: number;
  [key: string]: unknown;
}
interface Teacher {
  property_id: number;
  [key: string]: unknown;
}
interface FAQ {
  property_id: number;
  [key: string]: unknown;
}
interface Coupon {
  property_id: number;
  [key: string]: unknown;
}
interface Hiring {
  property_id: number;
  [key: string]: unknown;
}

// ---------------- ApiData mapping ----------------
type ApiData = {
  courses: Course[];
  gallery: Gallery[];
  accomodation: Accomodation[];
  amenities: Amenity[];
  certifications: Certification[];
  hours: BusinessHour[];
  teachers: Teacher[];
  faq: FAQ[];
  coupons: Coupon[];
  hiring: Hiring[];
};

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://yogprerna.com";

  const tabs = [
    { id: "overview", label: "Overview", show: true },
    { id: "courses", label: "Courses" },
    { id: "gallery", label: "Gallery" },
    { id: "accomodation", label: "Accomodation" },
    { id: "amenities", label: "Amenities" },
    { id: "certifications", label: "Certifications" },
    { id: "hours", label: "Working Hours" },
    { id: "teachers", label: "Teachers" },
    { id: "faq", label: "FAQ" },
    { id: "reviews", label: "Reviews", show: true },
    { id: "coupons", label: "Coupons" },
    { id: "hiring", label: "Hiring" },
  ] as const;

  let allProperties: PropertyProps[] = [];
  let allCategory: CategoryProps[] = [];
  const apiData: ApiData = {
    courses: [],
    gallery: [],
    accomodation: [],
    amenities: [],
    certifications: [],
    hours: [],
    teachers: [],
    faq: [],
    coupons: [],
    hiring: [],
  };

  try {
    const [
      propertyRes,
      catRes,
      courseRes,
      galleryRes,
      accomodationRes,
      amenitiesRes,
      certificationRes,
      businessHoursRes,
      teacherRes,
      faqsRes,
      couponsRes,
      hiringRes,
    ] = await Promise.allSettled([
      API.get("/property", { headers: { origin: baseUrl } }),
      API.get("/category", { headers: { origin: baseUrl } }),
      API.get("/property-course", { headers: { origin: baseUrl } }),
      API.get("/gallery", { headers: { origin: baseUrl } }),
      API.get("/accomodation", { headers: { origin: baseUrl } }),
      API.get("/amenities", { headers: { origin: baseUrl } }),
      API.get("/certifications", { headers: { origin: baseUrl } }),
      API.get("/business-hours", { headers: { origin: baseUrl } }),
      API.get("/teacher", { headers: { origin: baseUrl } }),
      API.get("/faqs", { headers: { origin: baseUrl } }),
      API.get("/coupons", { headers: { origin: baseUrl } }),
      API.get("/hiring", { headers: { origin: baseUrl } }),
    ]);

    if (propertyRes.status === "fulfilled")
      allProperties = propertyRes.value.data.filter(
        (p: PropertyProps) => p.status?.toLowerCase() === "active"
      );
    if (catRes.status === "fulfilled") allCategory = catRes.value.data;

    const apiMapping: { [K in keyof ApiData]: PromiseSettledResult<any> } = {
      courses: courseRes,
      gallery: galleryRes,
      accomodation: accomodationRes,
      amenities: amenitiesRes,
      certifications: certificationRes,
      hours: businessHoursRes,
      teachers: teacherRes,
      faq: faqsRes,
      coupons: couponsRes,
      hiring: hiringRes,
    };

    for (const key of Object.keys(apiMapping) as (keyof ApiData)[]) {
      const res = apiMapping[key];
      if (res.status === "fulfilled" && Array.isArray(res.value.data)) {
        apiData[key] = res.value.data;
      } else {
        apiData[key] = [];
      }
    }
  } catch (error) {
    console.error("Error fetching APIs:", error);
  }

  const getCategoryById = (id: string) => {
    const cat = allCategory.find((item) => item.uniqueId === Number(id));
    return cat?.category_name || "";
  };

  const propertyRoutes = allProperties.flatMap((property) => {
    const baseRoute = `/${encodeURIComponent(
      generateSlug(getCategoryById(property.category))
    )}/${encodeURIComponent(property.property_slug)}`;

    const propertyTabs = tabs.filter((tab) => {
      if (tab.id === "overview" || tab.id === "reviews") return true;

      const tabData = apiData[tab.id as keyof ApiData];
      if (!tabData || tabData.length === 0) return false;

      if (tab.id === "gallery" || tab.id === "amenities") {
        return (tabData as (Gallery | Amenity)[]).some(
          (item) => item.propertyId === property.uniqueId
        );
      }

      return (tabData as { property_id: number }[]).some(
        (item) => item.property_id === property.uniqueId
      );
    });

    return propertyTabs.map((tab) => `${baseRoute}/${tab.id}`);
  });

  const now = new Date().toISOString();
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${propertyRoutes
  .map(
    (route) => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
  )
  .join("")}
</urlset>`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml" },
  });
}
