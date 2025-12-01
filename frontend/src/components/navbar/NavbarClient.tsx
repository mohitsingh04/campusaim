"use client";

import { getProfile, getToken, handleLogout } from "@/contexts/getAssets";
import { UserProps } from "@/types/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { LuLogOut, LuMenu, LuSearch, LuUser, LuX } from "react-icons/lu";
import SearchModal from "../searchModal/SearchModal";
import Image from "next/image";

const navItems = [
  { name: "Home", href: "/", external: false },
  { name: "Yoga Institutes", href: "/yoga-institutes", external: false },
  { name: "Course", href: "/courses", external: false },
  // {
  //   name: "Jobs",
  //   href: `${process.env.NEXT_PUBLIC_CAREER_URL}`,
  //   external: true,
  // },
  { name: "Blog", href: "/blog", external: false },
  { name: "Events", href: "/events", external: false },
  { name: "News and Updates", href: "/news-and-updates", external: false },
];

const userMenuItems = [
  { name: "Profile", href: "/profile", icon: LuUser },
  { name: "Professional", href: "/profile/professional", icon: LuUser },
  { name: "Logout", href: "/logout", icon: LuLogOut },
];

export default function NavbarClient() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState<UserProps | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const tokenRes = await getToken();
      const profileRes = await getProfile();
      if (profileRes) setProfile(profileRes);
      if (tokenRes) setToken(tokenRes);
    };
    checkToken();
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      window.location.href = `/search?q=${encodeURIComponent(
        searchQuery.trim()
      )}`;
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const renderUserMenuItems = () =>
    userMenuItems
      .filter((item) => {
        if (item.name === "Profile" && profile?.isProfessional) return false;
        if (item.name === "Professional" && !profile?.isProfessional)
          return false;
        if (item?.name === "Dashboard" && profile?.role === "User")
          return false;
        return true;
      })
      .map((item) =>
        item.name === "Logout" ? (
          <button
            key={item.name}
            onClick={async () => {
              await handleLogout();
              setIsUserMenuOpen(false);
              setIsMobileOpen(false);
            }}
            className="w-full text-left flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
          >
            <item.icon className="w-4 h-4" />
            <span>{item.name}</span>
          </button>
        ) : (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => {
              setIsUserMenuOpen(false);
              setIsMobileOpen(false);
            }}
            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
          >
            <item.icon className="w-4 h-4" />
            <span>{item.name}</span>
          </Link>
        )
      );

  return (
    <div className="flex items-center space-x-2 md:space-x-4">
      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center space-x-1">
        {navItems.map(({ name, href, external }) =>
          external ? (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive(href)
                  ? "text-purple-700 bg-purple-50 border border-purple-100"
                  : "text-gray-700 hover:text-purple-700 hover:bg-purple-50"
              }`}
            >
              {name}
            </a>
          ) : (
            <Link
              key={name}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive(href)
                  ? "text-purple-700 bg-purple-50 border border-purple-100"
                  : "text-gray-700 hover:text-purple-700 hover:bg-purple-50"
              }`}
            >
              {name}
            </Link>
          )
        )}
      </div>

      {/* Desktop Right Section */}
      <div className="hidden md:flex items-center space-x-3">
        {/* Search */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="p-2 rounded-lg text-gray-700 hover:text-purple-700 hover:bg-purple-50 transition"
        >
          <LuSearch className="w-5 h-5" />
        </button>

        {/* Auth / Profile */}
        {!token ? (
          <Link
            href="/auth/login"
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:shadow-md hover:scale-105 transition"
          >
            Login
          </Link>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 bg-purple-100 hover:bg-purple-600 hover:text-white text-purple-700 px-3 py-2 rounded-lg transition"
            >
              <div className="relative w-6 h-6">
                <Image
                  src={
                    profile?.avatar?.[0]
                      ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${profile?.avatar?.[0]}`
                      : "/img/default-images/yp-user.webp"
                  }
                  alt={profile?.username || "User avatar"}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <span className="text-sm font-medium truncate max-w-[100px]">
                {profile?.username}
              </span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-md border border-gray-100 z-50 animate-fadeIn">
                {renderUserMenuItems()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg text-gray-700 hover:text-purple-700 hover:bg-purple-50 transition"
        >
          {isMobileOpen ? (
            <LuX className="w-6 h-6" />
          ) : (
            <LuMenu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMobileOpen && (
        <div className="absolute left-0 top-16 w-full bg-white border-t border-gray-100 shadow-md animate-slideDown md:hidden z-40">
          <div className="px-4 py-4 space-y-3">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex items-center space-x-2 w-full px-4 py-3 rounded-lg text-sm text-gray-700 hover:text-purple-700 hover:bg-purple-50 transition"
            >
              <LuSearch className="w-5 h-5" />
              <span>Search</span>
            </button>

            {isSearchOpen && (
              <form onSubmit={handleSearchSubmit} className="mt-2">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </form>
            )}

            {/* Links */}
            {navItems.map(({ name, href, external }) =>
              external ? (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive(href)
                      ? "text-purple-700 bg-purple-50 border-l-4 border-purple-600"
                      : "text-gray-700 hover:text-purple-700 hover:bg-purple-50"
                  }`}
                >
                  {name}
                </a>
              ) : (
                <Link
                  key={name}
                  href={href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive(href)
                      ? "text-purple-700 bg-purple-50 border-l-4 border-purple-600"
                      : "text-gray-700 hover:text-purple-700 hover:bg-purple-50"
                  }`}
                >
                  {name}
                </Link>
              )
            )}

            {/* Auth */}
            <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
              {!token ? (
                <Link
                  href="/auth/login"
                  className="block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg text-sm font-semibold text-center transition"
                >
                  Login
                </Link>
              ) : (
                <div className="space-y-1">{renderUserMenuItems()}</div>
              )}
            </div>
          </div>
        </div>
      )}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
