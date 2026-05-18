import { redirect } from "next/navigation";
import { generateSlug } from "@/context/Callbacks";

interface PageProps {
  params: Promise<{ property_slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { property_slug } = await params;
  if (property_slug) {
    const cleanSlug = generateSlug(property_slug);
    redirect(`/school/${cleanSlug}/overview`);
  }
  return null;
}
