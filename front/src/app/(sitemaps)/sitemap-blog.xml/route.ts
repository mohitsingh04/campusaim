import API from "@/context/API";
import { BlogsProps } from "@/types/BlogTypes";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://yogprerna.com";

  let allBlogs: BlogsProps[] = [];
  let allSeo: any[] = [];

  try {
    // 1️⃣ Fetch Blogs
    const response = await API.get("/blog", {
      headers: { origin: baseUrl },
    });

    allBlogs = response.data.filter(
      (item: BlogsProps) => item.status === "Active"
    );

    // 2️⃣ Fetch SEO for Blogs
    const seoRes = await API.get(`/all/seo?type=blog`, {
      headers: { origin: baseUrl },
    });

    allSeo = seoRes.data || [];
  } catch (error) {
    console.error("Error generating blog sitemap:", error);
  }

  const now = new Date().toISOString();

  // 3️⃣ Build Sitemap — Skip blogs without SEO slug
  const sitemapEntries = allBlogs
    .map((blog) => {
      const seo = allSeo.find((s) => s.blog_id === blog._id);

      if (!seo?.slug) return ""; // ⛔ Skip if no slug available

      const slug = encodeURIComponent(seo.slug.trim());

      return `
  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
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
