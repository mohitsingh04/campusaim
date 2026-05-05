import { redirect } from "next/navigation";
import { generateSlug } from "@/context/Callbacks";

interface PageProps {
  params: Promise<{
    category: string;
    property_slug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { category, property_slug } = await params;
  if (category && property_slug) {
    const cleanCategory = generateSlug(category);
    const cleanSlug = generateSlug(property_slug);
    redirect(`/${cleanCategory}/${cleanSlug}/overview`);
  }
  return null;
}
