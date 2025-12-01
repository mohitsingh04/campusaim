// src/app/(sitemaps)/sitemap.xml/route.ts
export async function GET(req: Request) {
	const envBase = process.env.NEXT_PUBLIC_BASE_URL;
	const originFromReq = new URL(req.url).origin;
	const baseUrl = (envBase || originFromReq).replace(/\/+$/, "");
	const now = new Date().toISOString();

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-questions.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-topics.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=0, s-maxage=3600",
		},
	});
}
