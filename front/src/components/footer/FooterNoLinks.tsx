import React, { useState } from "react";
import { BottomNavBar } from "./BottomNavbar";
import SearchModal from "../search_modal/SearchModal";
import Link from "next/link";
import { LuHeart } from "react-icons/lu";
import { useResponsive } from "@/hooks/useResponsive";
import { LEGAL_LINKS } from "@/common/LegalLinks";

export default function FooterNoLinks() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useResponsive();
  return (
    <div>
      <footer className="bg-(--primary-bg) text-(--text-color) py-10 px-4 sm:px-8">
        <div className="container mx-auto ">
          <div className="text-center text-sm mb-6">
            {LEGAL_LINKS.map((item, i) => (
              <span key={i}>
                <Link
                  href={item.href}
                  className="hover:underline transition-colors"
                >
                  {item.name}
                </Link>

                {i !== LEGAL_LINKS.length - 1 && (
                  <span className="mx-2">|</span>
                )}
              </span>
            ))}
          </div>

          <div className="text-center text-sm">
            <p className="mb-10 md:mb-2">
              © {new Date().getFullYear()}{" "}
              <Link href="/" className="font-medium">
                Yogprerna
              </Link>{" "}
              , Inc. All Rights Reserved.
            </p>

            <p className="flex items-center justify-center">
              Build with{" "}
              <span className="mx-1">
                <LuHeart className="fill-(--danger) text-(--danger)" />
              </span>
            </p>
          </div>
        </div>
      </footer>
      {isMobile && <BottomNavBar setIsSearchOpen={setIsSearchOpen} />}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
