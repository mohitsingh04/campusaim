import API from "@/contexts/API";
import { generateSlug } from "@/contexts/Callbacks";
import { NewsProps } from "@/types/types";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://yogprerna.com";

  let allNews: NewsProps[] = [];

  try {
    const response = await API.get("/news-and-updates", {
      headers: { origin: baseUrl },
    });

    allNews = response.data.filter(
      (item: NewsProps) => item.status === "Published"
    );
  } catch (error) {
    console.error("Error fetching news:", error);
  }

  const now = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allNews
  .map((post) => {
    const slug = encodeURIComponent(generateSlug(post.title));
    return `
  <url>
    <loc>${baseUrl}/news-and-updates/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join("")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
