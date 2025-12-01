import { API } from "@/services/api";

interface Question {
	_id: string;
	slug?: string;
	updatedAt?: string;
}

export async function GET(req: Request) {
	const envBase = process.env.NEXT_PUBLIC_BASE_URL;
	const originFromReq = new URL(req.url).origin;
	const baseUrl = (envBase || originFromReq).replace(/\/+$/, "");

	let questions: Question[] = [];

	try {
		const questionRes = await API.get(`/questions`, {
			headers: { origin: baseUrl },
		});
		questions = Array.isArray(questionRes.data?.data)
			? questionRes.data?.data
			: [];
	} catch (error) {
		console.error("Error fetching questions for sitemap:", error);
	}

	const questionUrls = questions
		.filter((q) => q.slug)
		.map((q) => {
			const lastmod = new Date(q.updatedAt || Date.now()).toISOString();
			return `
  <url>
    <loc>${baseUrl}/question/${encodeURIComponent(q.slug as string)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
		})
		.join("");

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${questionUrls}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=0, s-maxage=3600",
		},
	});
}
