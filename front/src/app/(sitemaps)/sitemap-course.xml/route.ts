import API from "@/context/API";
import { CourseProps } from "@/types/Types";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://yogprerna.com";

  let allCourse: CourseProps[] = [];
  let allSeo: any[] = [];

  try {
    // 1️⃣ Fetch Courses
    const response = await API.get("/course", {
      headers: { origin: baseUrl },
    });

    allCourse = response.data;

    // 2️⃣ Fetch SEO for courses
    const seoRes = await API.get(`/all/seo?type=course`, {
      headers: { origin: baseUrl },
    });

    allSeo = seoRes.data || [];
  } catch (error) {
    console.error("Error generating course sitemap:", error);
  }

  const now = new Date().toISOString();

  // 3️⃣ Build sitemap (skip items with no SEO slug)
  const sitemapEntries = allCourse
    .map((course) => {
      const seo = allSeo.find((s) => s.course_id === course._id);

      if (!seo?.slug) return ""; // ⛔ skip course without SEO slug

      const slug = encodeURIComponent(seo.slug.trim());

      return `
  <url>
    <loc>${baseUrl}/course/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    })
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
