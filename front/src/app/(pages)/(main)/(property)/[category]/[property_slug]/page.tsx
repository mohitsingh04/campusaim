"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { generateSlug } from "@/context/Callbacks";
import InstituteDetailLoader from "@/ui/loader/page/institutes/InstituteDetail";

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
