import API from "@/context/API";
import { ExamProps } from "@/types/Types";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://campusaim.com";

  let allExams: ExamProps[] = [];
  let allSeo: any[] = [];

  try {
    const response = await API.get("/exam", {
      headers: { origin: baseUrl },
    });

    allExams = response.data;

    const seoRes = await API.get(`/all/seo?type=exam`, {
      headers: { origin: baseUrl },
    });

    allSeo = seoRes.data || [];
  } catch (error) {
    console.error("Error generating exams sitemap:", error);
  }

  const now = new Date().toISOString();

  const sitemapEntries = allExams
    .map((exa) => {
      const seo = allSeo.find((s) => s.exam_id === exa._id);

      if (!seo?.slug) return "";

      const slug = encodeURIComponent(seo.slug.trim());

      return `
  <url>
    <loc>${baseUrl}/exam/${slug}</loc>
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
