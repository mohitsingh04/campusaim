"use client";
import { useTheme } from "@/hooks/useTheme";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function YpLogo({ size = "h-8 w-44" }: { size?: string }) {
  const { theme } = useTheme();
  const [img, setImg] = useState("/img/logo/logo-black.png");

  useEffect(() => {
    if (theme === "dark") {
      setImg("/img/logo/logo-white.png");
    } else {
      setImg("/img/logo/logo-black.png");
    }
  }, [theme]);

  return (
    <Link href="/" className="shrink-0">
      <div className={`relative ${size}`}>
        <Image
          src={img}
          alt="Yogprerna Black Logo"
          fill
          className="object-contain transition-transform duration-200 group-hover:scale-105"
          sizes="auto"
        />
      </div>
    </Link>
  );
}
