"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/ui/loader/Loading";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/settings/account`);
  }, [router]);

  return <Loading />;
}
