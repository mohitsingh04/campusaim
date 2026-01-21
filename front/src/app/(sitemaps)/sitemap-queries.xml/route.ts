import API from "@/context/API";
import { generateSlug, getFieldDataSimple } from "@/context/Callbacks";
import { PropertyLocationProps, PropertyProps } from "@/types/PropertyTypes";
import { CategoryProps } from "@/types/Types";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() || "https://yogprerna.com";

  if (!baseUrl) {
    return new Response("Base URL not configured", { status: 500 });
  }

  try {
    const [propertyRes, locationRes, categoryRes] = await Promise.allSettled([
      API.get("/property", { headers: { origin: baseUrl } }),
      API.get("/locations", { headers: { origin: baseUrl } }),
      API.get("/category", { headers: { origin: baseUrl } }),
    ]);

    const allProperties: PropertyProps[] =
      propertyRes.status === "fulfilled"
        ? propertyRes.value.data.filter(
            (p: PropertyProps) => p.status === "Active"
          )
        : [];

    const allLocations: PropertyLocationProps[] =
      locationRes.status === "fulfilled" ? locationRes.value.data : [];

    const allCategories: CategoryProps[] =
      categoryRes.status === "fulfilled" ? categoryRes.value.data : [];

    if (!allProperties.length || !allCategories.length) {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
        { headers: { "Content-Type": "application/xml" } }
      );
    }

    const normalize = (val?: string) => val?.toString().trim().toLowerCase();

    const getCategoryName = (id: string | number) => {
      const found = allCategories.find(
        (c) => String(c.uniqueId) === String(id)
      );
      return found?.category_name?.trim() || "";
    };

    const finalProperties = allProperties.map((property) => {
      const location = allLocations.find(
        (loc) => Number(loc.property_id) === property.uniqueId
      );

      return {
        ...property,
        ...location,
        category: getCategoryName(property.category),
        property_type: getCategoryName(property.property_type),
      };
    });

    const types = ["top", "best"];
    const numbers = [3, 5, 10, 20, 50, 100];

    const categoryList = (await getFieldDataSimple(finalProperties, "category"))
      .map(normalize)
      .filter(Boolean);

    const keywordSet = new Set<string>();

    for (const cat of categoryList) {
      for (const type of types) {
        keywordSet.add(`${type} ${cat}`);

        for (const num of numbers) {
          keywordSet.add(`${type} ${num} ${cat}`);
        }
      }
    }

    for (const cat of categoryList) {
      const related = finalProperties.filter(
        (p) => normalize(p.category) === cat
      );

      if (!related.length) continue;

      const cities = (await getFieldDataSimple(related, "property_city")).map(
        normalize
      );

      const states = (await getFieldDataSimple(related, "property_state")).map(
        normalize
      );

      const countries = (
        await getFieldDataSimple(related, "property_country")
      ).map(normalize);

      const locations = [...cities, ...states, ...countries].filter(Boolean);

      for (const loc of locations) {
        for (const type of types) {
          keywordSet.add(`${type} ${cat} in ${loc}`);

          for (const num of numbers) {
            keywordSet.add(`${type} ${num} ${cat} in ${loc}`);
          }
        }
      }
    }

    const now = new Date().toISOString();

    const urls = Array.from(keywordSet)
      .sort()
      .map(
        (keyword) => `
  <url>
    <loc>${baseUrl}/${generateSlug(keyword)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
      )
      .join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new Response(sitemap, {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  } catch (err) {
    console.error("Sitemap generation failed:", err);

    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      { headers: { "Content-Type": "application/xml" } }
    );
  }
}
