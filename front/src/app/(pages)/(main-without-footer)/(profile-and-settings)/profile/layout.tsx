import Loading from "@/ui/loader/Loading";
import { ReactNode, Suspense } from "react";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}
