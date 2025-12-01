import { API } from "@/services/api";

interface Topic {
	_id: string;
	slug: string;
	updatedAt?: string;
	parent_category?: string;
}

export async function GET(req: Request) {
	const envBase = process.env.NEXT_PUBLIC_BASE_URL;
	const originFromReq = new URL(req.url).origin;
	const baseUrl = (envBase || originFromReq).replace(/\/+$/, "");
	
	let topics: Topic[] = [];

	try {
		const topicRes = await API.get(`/categories`, {
			headers: { origin: baseUrl },
		});
		const rawTopics = topicRes.data.filter(
			(a: Topic) => a?.parent_category === "Ask"
		);
		topics = rawTopics;
	} catch (error) {
		console.error("Error fetching topics for sitemap:", error);
		return new Response(
			`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
			{
				headers: { "Content-Type": "application/xml" },
			}
		);
	}

	const topicUrls = topics
		.map((topic) => {
			return `
    <url>
      <loc>${baseUrl}/topic/${topic.slug}</loc>
      <lastmod>${new Date(
				topic.updatedAt || Date.now()
			).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>`;
		})
		.join("");

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${topicUrls}
</urlset>
`;

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml",
		},
	});
}
