import API from "@/context/API";
import { EventProps } from "@/types/Types";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://yogprerna.com";

  let allEvents: EventProps[] = [];
  let allSeo: any[] = [];

  try {
    // 1️⃣ Fetch Events
    const response = await API.get("/events", {
      headers: { origin: baseUrl },
    });

    allEvents = response.data.filter(
      (item: EventProps) => item.status === "Active"
    );

    // 2️⃣ Fetch SEO for events
    const seoRes = await API.get(`/all/seo?type=event`, {
      headers: { origin: baseUrl },
    });

    allSeo = seoRes.data || [];
  } catch (error) {
    console.error("Error generating event sitemap:", error);
  }

  const now = new Date().toISOString();

  // 3️⃣ Build Sitemap (skip if slug missing)
  const sitemapEntries = allEvents
    .map((event) => {
      const seo = allSeo.find((s) => s.event_id === event._id);

      if (!seo?.slug) return ""; // ⛔ skip if no SEO slug

      const slug = encodeURIComponent(seo.slug.trim());

      return `
  <url>
    <loc>${baseUrl}/event/${slug}</loc>
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
