import API from "@/context/API";
import { generateSlug, mergeCourseData } from "@/context/Callbacks";

import {
  PropertyProps,
  PropertyCourseProps,
  PropertyGalleryProps,
  PropertyAccommodationProps,
  AmenitiesProps,
  PropertyWorkingHoursProps,
  PropertyTeacherProps,
  PropertyFaqProps,
  PropertyCouponsProps,
  PropertyHiringProps,
} from "@/types/PropertyTypes";

import { CategoryProps, CourseProps } from "@/types/Types";

// ---------------- XML Escape helper ----------------
function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ---------------- ApiData (fully typed) ----------------
type ApiData = {
  propertyCourses: PropertyCourseProps[];
  mainCourses: CourseProps[];
  mergedCourses: any[];
  gallery: PropertyGalleryProps[];
  accomodation: PropertyAccommodationProps[];
  amenities: AmenitiesProps[];
  certifications: any[];
  hours: PropertyWorkingHoursProps[];
  teachers: PropertyTeacherProps[];
  faq: PropertyFaqProps[];
  coupons: PropertyCouponsProps[];
  hiring: PropertyHiringProps[];
};

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://yogprerna.com";

  const tabs = [
    { id: "overview", show: true },
    { id: "courses" },
    { id: "gallery" },
    { id: "accomodation" },
    { id: "amenities" },
    { id: "certifications" },
    { id: "hours" },
    { id: "teachers" },
    { id: "faq" },
    { id: "reviews", show: true },
    { id: "coupons" },
    { id: "hiring" },
  ] as const;

  let allProperties: PropertyProps[] = [];
  let allCategory: CategoryProps[] = [];

  const apiData: ApiData = {
    propertyCourses: [],
    mainCourses: [],
    mergedCourses: [],
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

  // ---------------- Fetch All APIs ----------------
  try {
    const [
      propertyRes,
      catRes,
      propertyCourseRes,
      mainCourseRes,
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
      API.get("/course", { headers: { origin: baseUrl } }),
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

    if (propertyCourseRes.status === "fulfilled")
      apiData.propertyCourses = propertyCourseRes.value.data;

    if (mainCourseRes.status === "fulfilled")
      apiData.mainCourses = mainCourseRes.value.data;

    // 🔥 Merge property-course + main-course
    apiData.mergedCourses = mergeCourseData(
      apiData.propertyCourses,
      apiData.mainCourses
    );

    // For other collections
    type MappedKey =
      | "gallery"
      | "accomodation"
      | "amenities"
      | "certifications"
      | "hours"
      | "teachers"
      | "faq"
      | "coupons"
      | "hiring";

    const mapping: Record<MappedKey, PromiseSettledResult<any>> = {
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
    (Object.keys(mapping) as MappedKey[]).forEach((key) => {
      const res = mapping[key];
      apiData[key] =
        res.status === "fulfilled" && Array.isArray(res.value.data)
          ? res.value.data
          : [];
    });
  } catch (err) {
    console.error("API Error:", err);
  }

  // ---------------- Category Getter ----------------
  const getCategoryById = (id: string | number) => {
    return (
      allCategory.find((c) => Number(c.uniqueId) === Number(id))
        ?.category_name || ""
    );
  };

  // ---------------- Build Routes ----------------
  const propertyRoutes = allProperties.flatMap((property) => {
    const categorySlug = generateSlug(getCategoryById(property.category));
    const baseRoute = `/${categorySlug}/${property.property_slug}`;

    const routes: string[] = [];

    // ALWAYS include overview + reviews
    routes.push(`${baseRoute}/overview`);
    routes.push(`${baseRoute}/reviews`);

    // Condition map for each tab
    const hasDataForTab = {
      courses:
        apiData.mergedCourses.filter(
          (c) => String(c.property_id) === String(property._id)
        ).length > 0,
      gallery:
        apiData.gallery.filter(
          (g) => String(g.property_id) === String(property._id)
        ).length > 0,
      accomodation:
        apiData.accomodation.filter(
          (a) => String(a.property_id) === String(property._id)
        ).length > 0,
      amenities:
        apiData.amenities.filter(
          (a) => String(a.propertyId) === String(property.uniqueId)
        ).length > 0,
      certifications:
        apiData.certifications.filter(
          (c) => String(c.property_id) === String(property._id)
        ).length > 0,
      hours:
        apiData.hours.filter(
          (h) => String(h.property_id) === String(property.uniqueId)
        ).length > 0,
      teachers:
        apiData.teachers.filter(
          (t) => String(t.property_id) === String(property._id)
        ).length > 0,
      faq:
        apiData.faq.filter(
          (f) => String(f.property_id) === String(property.uniqueId)
        ).length > 0,
      coupons:
        apiData.coupons.filter(
          (c) => String(c.property_id) === String(property.uniqueId)
        ).length > 0,
      hiring:
        apiData.hiring.filter(
          (h) => String(h.property_id) === String(property.uniqueId)
        ).length > 0,
    };

    // Add tabs only when data exists
    tabs.forEach((tab) => {
      if (tab.id === "overview" || tab.id === "reviews") return;

      const key = tab.id as keyof typeof hasDataForTab;

      if (hasDataForTab[key]) {
        routes.push(`${baseRoute}/${tab.id}`);
      }
    });

    // 🔥 Add Course Detail URLs
    const courses = apiData.mergedCourses.filter(
      (c) => String(c.property_id) === String(property._id)
    );

    courses.forEach((course) => {
      if (!course.course_name) return;
      const courseSlug = generateSlug(course.course_name);
      routes.push(`${baseRoute}/courses/${courseSlug}`);
    });

    return routes;
  });

  // ---------------- Final XML ----------------
  const now = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${propertyRoutes
  .map(
    (route) => `
  <url>
    <loc>${escapeXml(baseUrl + route)}</loc>
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
