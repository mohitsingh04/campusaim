"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
