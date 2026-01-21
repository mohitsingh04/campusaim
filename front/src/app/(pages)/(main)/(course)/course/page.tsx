"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CourseDetailSkeleton from "@/ui/loader/page/courses/CourseDetailSkeleton";
import InsitutesLoader from "@/ui/loader/page/institutes/Institutes";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/courses`);
  }, [router]);

  return (
    <>
      <CourseDetailSkeleton />
      <InsitutesLoader />
    </>
  );
}
