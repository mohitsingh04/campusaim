import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import { NewsProps } from "@/types/NewsTypes";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://yogprerna.com";

  let allNews: NewsProps[] = [];
  let allSeo: any[] = [];

  try {
    // Fetch News
    const newsRes = await API.get("/news-and-updates", {
      headers: { origin: baseUrl },
    });

    allNews = newsRes.data.filter(
      (item: NewsProps) => item.status === "Published"
    );

    // Fetch SEO for news
    const seoRes = await API.get(`/all/seo/?type=news`, {
      headers: { origin: baseUrl },
    });

    allSeo = seoRes.data || [];
  } catch (error) {
    getErrorResponse(error, true);
  }

  const now = new Date().toISOString();

  // Create Sitemap (skip if no SEO slug)
  const sitemapEntries = allNews
    .map((post) => {
      const seo = allSeo.find((s) => s.news_id === post._id);

      if (!seo?.slug) return ""; // ⛔ skip

      const slug = encodeURIComponent(seo.slug.trim());

      return `
  <url>
    <loc>${baseUrl}/news-and-updates/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
