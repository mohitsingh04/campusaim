import API from "@/contexts/API";
import { generateSlug } from "@/contexts/Callbacks";
import { BlogsProps } from "@/types/types";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://campusaim.com";

  let allBlogs: BlogsProps[] = [];

  try {
    const response = await API.get("/blog", {
      headers: { origin: baseUrl },
    });

    allBlogs = response.data.filter(
      (item: BlogsProps) => item.status === "Active"
    );
  } catch (error) {
    console.error("Error fetching blogs:", error);
  }

  const now = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allBlogs
  .map((post) => {
    const slug = encodeURIComponent(generateSlug(post.title));

    return `  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
