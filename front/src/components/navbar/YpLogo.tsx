"use client";
import { useTheme } from "@/hooks/useTheme";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function YpLogo({ size = "h-8 w-44" }: { size?: string }) {
  const { theme } = useTheme();
  const [img, setImg] = useState("/img/logo/campusaim-logo.png");

  useEffect(() => {
    if (theme === "dark") {
      setImg("/img/logo/campusaim-logo.png");
    } else {
      setImg("/img/logo/campusaim-logo.png");
    }
  }, [theme]);

  return (
    <Link href="/" className="shrink-0">
      <div className={`relative ${size}`}>
        <Image
          src={img}
          alt="Campusaim Logo"
          fill
          className="object-contain transition-transform duration-200 group-hover:scale-105"
          sizes="auto"
        />
      </div>
    </Link>
  );
}
