"use client";

import ThemeButton from "@/components/navbar/ThemeButton";
import YpLogo from "@/components/navbar/YpLogo";
import Link from "next/link";
import React from "react";
import { FiMenu, FiHome } from "react-icons/fi";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function TopBar({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-(--primary-bg) backdrop-blur-md shadow-custom">
      <div className="flex items-center justify-between px-4 py-1 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-custom transition-all hover:opacity-80"
          >
            <FiMenu className="w-5 h-5 text-(--text-color)" />
          </button>

          <YpLogo size="w-42 h-16" />
        </div>

        {/* Right Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href={`/`}
            className="flex items-center gap-2 text-sm font-medium text-(--text-color) px-3 py-2 rounded-lg hover:opacity-80 transition-all"
          >
            <FiHome className="w-4 h-4" />
            Home
          </Link>
          <ThemeButton />
        </nav>
      </div>
    </header>
  );
}
