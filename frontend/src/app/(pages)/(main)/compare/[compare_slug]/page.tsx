import { Metadata } from "next";
import { redirect } from "next/navigation";
import CompareProperties from "./CompareProperties";
import { PropertyProps } from "@/types/types";
import API from "@/contexts/API";
import { AxiosError } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ compare_slug: string }>;
}): Promise<Metadata> {
	const { compare_slug } = await params;

	if (!compare_slug || compare_slug === "select") {
		return { title: "Compare Yoga Institutes" };
	}

	const slugsArray = compare_slug.split("-vs-");

	if (slugsArray.length > 3) {
		const trimmed = slugsArray.slice(0, 3);
		const newSlug = trimmed.join("-vs-");
		redirect(`/compare/${newSlug}`);
	}

	// Fetch all property data
	const properties: PropertyProps[] = [];

	for (const slug of slugsArray) {
		try {
			const res = await API.get(`/property/slug/${slug}`, {
				headers: { origin: BASE_URL },
			});
			if (res.data) properties.push(res.data);
		} catch (err) {
			const error = err as AxiosError<{ error: string }>;
			console.warn(`Property not found for slug: ${slug}`, error.message);
		}
	}

	// No valid property found
	if (properties.length === 0) {
		return { title: "Compare Yoga Institutes" };
	}

	// 🏷️ Title
	const title =
		properties.length === 1
			? properties[0].property_name
			: properties.map((p) => p.property_name).join(" vs ");

	// 🧠 Description
	const description =
		"Discover verified colleges and universities, explore accredited courses, and make informed academic decisions with trusted admission insights—tailored to your goals.";

	// 🏷️ Keywords (property names joined by comma)
	const keywords = properties.map((p) => p.property_name).join(", ");

	return {
		title,
		description,
		keywords,
		alternates: {
			canonical: `${BASE_URL}/compare/${compare_slug}`,
		},
		openGraph: {
			title,
			description,
		},
	};
}

export default async function ComparePage({
	params,
}: {
	params: Promise<{ compare_slug: string }>;
}) {
	const { compare_slug } = await params;

	let slugsArray: string[] = [];

	if (compare_slug && compare_slug !== "select") {
		slugsArray = compare_slug.split("-vs-");

		if (slugsArray.length > 3) {
			const trimmedSlugs = slugsArray.slice(0, 3);
			const newSlug = trimmedSlugs.join("-vs-");
			redirect(`/compare/${newSlug}`);
		}
	}

	return <CompareProperties slugs={slugsArray} />;
}
