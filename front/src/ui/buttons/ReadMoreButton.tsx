"use client";

import React from "react";
import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";

interface ReadMoreButtonProps {
  href: string;
  label?: string;
  className?: string;
}

const ReadMoreButton: React.FC<ReadMoreButtonProps> = ({
  href,
  label = "Read More",
  className = "",
}) => {
  return (
    <div
      className={`relative inline-block overflow-hidden rounded-full ${className}`}
    >
      {/* ✨ Animated Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-r from-(--main) from-5% via-transparent via-5% to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

      {/* Actual Button */}
      <Link
        href={href}
        className="relative z-10 group inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-(--text-color-emphasis) transition-colors duration-300"
      >
        <span className="relative">{label}</span>
        <span>
          <LuArrowRight className="mt-0.5 w-3.5 h-3.5" />
        </span>
      </Link>

      {/* ✨ Soft border effect */}
      <div className="absolute inset-0 border border-(--main) rounded-full opacity-20 group-hover:opacity-50 transition-all duration-500"></div>
    </div>
  );
};

export default ReadMoreButton;
