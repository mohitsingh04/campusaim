export async function GET() {
  const sitemapUrl = `${process.env.NEXT_PUBLIC_MAIN_URL}/sitemap.xml`;

  const urlsToPing = [
    `https://www.google.com/ping?sitemap=${sitemapUrl}`,
    `https://www.bing.com/ping?sitemap=${sitemapUrl}`,
  ];

  const results = await Promise.allSettled(urlsToPing.map((url) => fetch(url)));

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { "Content-Type": "application/json" },
  });
}
