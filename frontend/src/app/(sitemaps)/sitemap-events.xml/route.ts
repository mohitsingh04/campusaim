import API from "@/contexts/API";
import { generateSlug } from "@/contexts/Callbacks";
import { EventProps } from "@/types/types";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://yogprerna.com";

  let allEvents: EventProps[] = [];

  try {
    const response = await API.get("/events", {
      headers: { origin: baseUrl },
    });

    allEvents = response.data.filter(
      (item: EventProps) => item.status === "Active"
    );
  } catch (error) {
    console.error("Error fetching events:", error);
  }

  const now = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEvents
  .map((post) => {
    const slug = encodeURIComponent(generateSlug(post.title));
    return `
  <url>
    <loc>${baseUrl}/event/${slug}</loc>
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
