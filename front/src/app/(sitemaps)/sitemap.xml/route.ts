export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() || "https://yogprerna.com";

  if (!baseUrl) {
    return new Response("Base URL not configured", { status: 500 });
  }

  const now = new Date().toISOString();

  const sitemapFiles = [
    "sitemap-pages.xml",
    "sitemap-institutes.xml",
    "sitemap-blog.xml",
    "sitemap-events.xml",
    "sitemap-news-and-updates.xml",
    "sitemap-course.xml",
    "sitemap-queries.xml",
  ];

  const sitemapEntries = sitemapFiles
    .map(
      (file) => `
  <sitemap>
    <loc>${baseUrl}/${file}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
    )
    .join("");

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;

  return new Response(sitemapIndex, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
