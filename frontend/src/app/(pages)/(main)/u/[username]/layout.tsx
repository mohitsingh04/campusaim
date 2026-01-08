import { ReactNode, Suspense } from "react";
import API from "@/contexts/API";
import { notFound } from "next/navigation";
import { AxiosError } from "axios";
import { Metadata } from "next";
import { stripHtml } from "@/contexts/Callbacks";
import ProfessionalLoader from "@/components/Loader/Professional/ProfessionalLoader";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ username: string }>;
}): Promise<Metadata> {
	const { username } = await params;
	let profile = null;
	let bio = null;

	try {
		const res = await API.get(`/profile/username/${username}`, {
			headers: { origin: BASE_URL },
		});
		profile = res.data;
	} catch (error) {
		const err = error as AxiosError<{ error: string }>;
		console.error("Profile load error:", err.response?.data?.error);
		if (err?.response?.data?.error === "Property not found.") {
			notFound();
		}
	}

	if (profile?.uniqueId) {
		try {
			const bioRes = await API.get(`/profile/bio/${profile.uniqueId}`, {
				headers: { origin: BASE_URL },
			});
			bio = bioRes.data;
		} catch (error) {
			const err = error as AxiosError<{ error: string }>;
			const msg = err.response?.data?.error;
			if (msg && msg !== "Bio Not Found") {
				console.error("Error loading Bio:", msg);
			}
			bio = null;
		}
	}

	if (!profile) {
		return { title: "User Not Found" };
	}

	const title =
		bio?.heading && profile?.name
			? `${profile.name} ${bio.heading}`
			: profile?.name || "Profile";

	const description =
		(bio?.about && stripHtml(bio.about, 160)) ||
		"Discover authentic yoga institutes, learn from trusted instructors, and explore programs designed to bring balance and mindfulness into your everyday life.";

	return {
		title,
		description,
		keywords: bio?.heading || "yoga, professionals, instructors, wellness",
		alternates: {
			canonical: `${BASE_URL}/`,
		},
		openGraph: {
			title,
			description,
			images: profile.banner?.[0]
				? [
						{
							url: `${MEDIA_URL}/${profile.banner[0]}`,
							alt: profile.name || "User Image",
						},
				  ]
				: undefined,
		},
	};
}

export default async function PropertyLayout({
	children,
}: {
	children: ReactNode;
}) {
	return <Suspense fallback={<ProfessionalLoader />}>{children}</Suspense>;
}
