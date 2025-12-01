"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import InstituteDetailLoader from "@/components/Loader/Property/PropertyDetail";
import { generateSlug } from "@/contexts/Callbacks";

export default function Page() {
  const { category, property_slug } = useParams<{
    category: string;
    property_slug: string;
  }>();
  const router = useRouter();

  useEffect(() => {
    if (category && property_slug) {
      router.replace(
        `/${generateSlug(category)}/${generateSlug(property_slug)}/overview`
      );
    }
  }, [category, property_slug, router]);

  return <InstituteDetailLoader />;
}
