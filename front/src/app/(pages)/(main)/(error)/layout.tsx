import Loading from "@/ui/loader/Loading";
import React, { ReactNode, Suspense } from "react";

export default function Errolayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </div>
  );
}
