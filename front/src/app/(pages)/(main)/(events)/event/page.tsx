"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import InstitutesSkeleton from "@/ui/loader/page/landing/_components/InstitutesSkeleton";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/events`);
  }, [router]);

  return <InstitutesSkeleton />;
}
