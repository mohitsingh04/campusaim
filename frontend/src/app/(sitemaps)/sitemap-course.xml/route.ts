import API from "@/contexts/API";
import { generateSlug } from "@/contexts/Callbacks";
import { CourseProps } from "@/types/types";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://campusaim.com";

  let allCourse: CourseProps[] = [];

  try {
    const response = await API.get("/course", {
      headers: { origin: baseUrl },
    });
    allCourse = response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
  }

  const now = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allCourse
  .map((post) => {
    const slug = encodeURIComponent(generateSlug(post.course_name));

    return `
  <url>
    <loc>${baseUrl}/course/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  })
  .join("")}
</urlset>`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
