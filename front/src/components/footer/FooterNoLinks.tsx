import React, { useState } from "react";
import { BottomNavBar } from "./BottomNavbar";
import SearchModal from "../search_modal/SearchModal";
import Link from "next/link";
import { useResponsive } from "@/hooks/useResponsive";
import { LegaLinksComponents } from "@/common/LegalLinks";
import { HeartIcon } from "lucide-react";

export const CopyRightsFooter = () => {
  const year = new Date().getFullYear();
  return (
    <div className="text-center text-sm">
      <p className="mb-10 md:mb-2 text-(--text-color-emphasis)">
        © {year}{" "}
        <Link href="/" title={"Campusaim"} className="text-gradient">
          Campusaim
        </Link>
        , Inc. All Rights Reserved.
      </p>
      <p className="flex items-center justify-center text-(--text-color-emphasis)">
        Build with{" "}
        <span className="mx-1">
          <HeartIcon className="fill-(--danger) text-(--danger) w-4 h-4" />
        </span>
      </p>
    </div>
  );
};

export default function FooterNoLinks() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useResponsive();
  const closeSearch = () => setIsSearchOpen(false);
  return (
    <div>
      <footer className="bg-(--primary-bg) text-(--text-color) py-10 px-4 sm:px-8">
        <div className="container mx-auto ">
          <LegaLinksComponents />
          <CopyRightsFooter />
        </div>
      </footer>
      {isMobile && <BottomNavBar setIsSearchOpen={setIsSearchOpen} />}
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </div>
  );
}
