"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FiMenu, FiHome } from "react-icons/fi";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function TopBar({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-1 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all"
          >
            <FiMenu className="w-5 h-5 text-gray-700" />
          </button>

          {/* Logo + Title */}
          <Link
            href={`/`}
            className="relative w-42 h-16 flex items-center justify-center overflow-hidden"
          >
            <Image
              src="/img/logo/logo-black-new.png"
              alt="AI Logo"
              fill
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Right Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href={`/`}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
          >
            <FiHome className="w-4 h-4" />
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
