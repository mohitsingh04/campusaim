"use client";

import { useState, MouseEvent, useEffect } from "react";

import ThemeButton from "./ThemeButton";
import YpLogo from "./YpLogo";

import {
  useCoursesMenuData,
  useExamMenuData,
  usePropertyMenuData,
} from "./NavbarData";
import Link from "next/link";
import { getToken } from "@/context/getAssets";
import dynamic from "next/dynamic";
import useGetAuthUser from "@/hooks/fetch-hooks/useGetAuthUser";
import {
  NavbarMegaMenuGroup,
  NavbarMenuItemProps,
  NavbarMobileDetailMenuState,
  NavbarMobileSubMenuState,
} from "@/types/NavbarTypes";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  MenuIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { useGetAssets } from "@/context/providers/AssetsProviders";
import SettingsOffcanvas from "../setting/SettingOffcanvas";
import ProfileButton from "./_navbar_components/ProfileButton";
const NavbarLoader = dynamic(
  () => import("@/ui/loader/component/NavbarLoader"),
  {
    ssr: false,
  },
);
const SearchModal = dynamic(
  () => import("@/components/search_modal/SearchModal"),
  { ssr: false },
);
const SinglePanelDropdown = dynamic(
  () => import("./_navbar_components/SinglePanelDropdown"),
  { ssr: false },
);
const SubMenuPanelDropdown = dynamic(
  () => import("./_navbar_components/SubMenuPanelDropdown"),
  { ssr: false },
);
const MobileSubMenuSecond = dynamic(
  () => import("./_navbar_components/MobileSubMenuSecond"),
  { ssr: false },
);
const MobileSubMenu = dynamic(
  () => import("./_navbar_components/MobileSubMenu"),
  { ssr: false },
);

export default function Navbar() {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [activeDesktopSubMenu, setActiveDesktopSubMenu] = useState<
    string | null
  >(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSubMenu, setMobileSubMenu] =
    useState<NavbarMobileSubMenuState | null>(null);
  const [mobileDetailMenu, setMobileDetailMenu] =
    useState<NavbarMobileDetailMenuState | null>(null);

  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const { examLoading, examMenuData } = useExamMenuData();
  const { allCategories } = useGetAssets();
  const { courseMenuData, courseLoading } = useCoursesMenuData({
    categories: allCategories,
  });
  const universityMenu = usePropertyMenuData({ categories: allCategories });
  const [token, setToken] = useState("");
  const { authUser } = useGetAuthUser();
  const [settingOffcanvas, setSettingOffcanvas] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const tokenRes = await getToken();
      if (tokenRes) setToken(tokenRes);
    };
    checkToken();
  }, []);

  const menuItems: NavbarMenuItemProps[] = [
    {
      name: "Institutes",
      href: "/colleges",
      dropdownContent: universityMenu?.propertyMenuData,
    },
    {
      name: "Courses",
      href: "/courses",
      dropdownContent: courseMenuData,
    },
    {
      name: "Exams",
      href: "/exams",
      dropdownContent: examMenuData,
    },
    {
      name: "Ask",
      href: `${process.env.NEXT_PUBLIC_ASK_URL}`,
      external: true,
    },
  ];

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      setMobileSubMenu(null);
      setMobileDetailMenu(null);
    }, 300);
  };

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      handleCloseMobileMenu();
    } else {
      setIsMobileMenuOpen(true);
    }
  };

  const handleSubMenuClick = (e: MouseEvent, item: NavbarMenuItemProps) => {
    if (item.dropdownContent) {
      e.preventDefault();
      setMobileSubMenu({ title: item.name, data: item.dropdownContent });
    }
  };

  const handleDetailMenuClick = (
    e: MouseEvent,
    subItemName: string,
    subItemData: Record<string, unknown> | NavbarMegaMenuGroup,
  ) => {
    e.preventDefault();
    if (subItemData && Object.keys(subItemData).length > 0) {
      setMobileDetailMenu({
        title: subItemName,
        data: subItemData as NavbarMegaMenuGroup,
      });
      setActiveAccordion(Object.keys(subItemData)[0]);
    }
  };

  const handleDesktopMouseEnter = (item: NavbarMenuItemProps) => {
    if (!item.dropdownContent) return;
    setHoveredMenu(item.name);
    const firstKey = Object.keys(item.dropdownContent)[0];
    setActiveDesktopSubMenu(firstKey ?? null);
  };

  const handleDesktopMouseLeave = () => setHoveredMenu(null);

  const isPropertyLoading = universityMenu.propertyLoading;

  if (isPropertyLoading || courseLoading || examLoading) {
    return <NavbarLoader />;
  }

  return (
    <>
      <header className="bg-(--primary-bg) shadow-sm sticky top-0 z-40 px-4 m-0">
        <div className="container mx-auto flex items-center justify-between h-16">
          <div className="lg:hidden flex w-full justify-between items-center">
            <YpLogo />
            <div className="flex justify-start items-center gap-1">
              <ThemeButton />
              <button
                aria-label="Menu"
                onClick={toggleMobileMenu}
                className="p-2 -ml-2"
              >
                <MenuIcon className="w-6 h-6 text-(--text-color-emphasis)" />
              </button>
            </div>
          </div>

          <div className="hidden lg:flex w-full items-center justify-between gap-10">
            <YpLogo />
            <nav className="flex grow justify-start">
              <ul className="flex space-x-6 items-center">
                {menuItems.map((item: any) => (
                  <li
                    key={item.name}
                    className="py-6 static"
                    onMouseEnter={() => handleDesktopMouseEnter(item)}
                    onMouseLeave={handleDesktopMouseLeave}
                  >
                    <Link
                      href={item.href}
                      title={item?.name}
                      className="text-(--text-color) hover:text-(--main) transition inline-flex items-center"
                      onClick={handleDesktopMouseLeave}
                      target={item?.external ? "_blank" : "_self"}
                    >
                      {item.name}
                      {(item.name === "Institutes" ||
                        item.name === "Courses" ||
                        item.name === "Exams") && (
                        <ChevronDownIcon className="ml-1 mt-1 h-4 w-4" />
                      )}
                    </Link>

                    {hoveredMenu === item.name &&
                      (item.name === "Institutes" ||
                        item.name === "Courses" ||
                        item.name === "Exams") && (
                        <div className="absolute top-full left-0 right-0 bg-(--primary-bg) shadow-custom border-t border-(--border)">
                          {item.name === "Exams" && (
                            <SinglePanelDropdown
                              handleDesktopMouseLeave={handleDesktopMouseLeave}
                              dropdonwItem={item}
                              isLoading={item.isLoading}
                            />
                          )}
                          {(item.name === "Institutes" ||
                            item.name === "Courses") && (
                            <SubMenuPanelDropdown
                              handleDesktopMouseLeave={handleDesktopMouseLeave}
                              setActiveDesktopSubMenu={setActiveDesktopSubMenu}
                              activeDesktopSubMenu={activeDesktopSubMenu}
                              dropdownItem={item}
                              isLoading={item.isLoading}
                            />
                          )}
                        </div>
                      )}
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex items-center space-x-4 shrink-0">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Search"
                className="text-(--text-color-emphasis) h-10 w-10 flex items-center justify-center rounded-md transition"
              >
                <SearchIcon className="h-5 w-5" />
              </button>
              <ThemeButton />
              <ProfileButton
                authUser={authUser}
                token={token}
                setSettingOffcanvas={setSettingOffcanvas}
              />
            </div>
          </div>
        </div>
      </header>

      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleCloseMobileMenu}
        />
        <div
          className={`fixed top-0 left-0 h-full w-full max-w-sm bg-(--primary-bg) transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="relative w-full h-full overflow-hidden">
            <div
              className={`absolute inset-0 transition-transform duration-300 ${mobileSubMenu ? "-translate-x-full" : "translate-x-0"}`}
            >
              <div className="h-full flex flex-col">
                <div className="p-4 bg-(--main-emphasis) text-(--white) flex items-center justify-between">
                  <ProfileButton
                    authUser={authUser}
                    token={token}
                    setSettingOffcanvas={setSettingOffcanvas}
                    isMobile
                  />
                  <button
                    onClick={handleCloseMobileMenu}
                    aria-label="close-mobile-menu"
                    className="p-1"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
                <nav className="grow overflow-y-auto">
                  <ul className="flex flex-col">
                    {menuItems.map((item: any) => (
                      <li
                        key={item.name}
                        className="border-b border-(--border)"
                      >
                        <Link
                          href={item.href}
                          title={item?.name}
                          onClick={(e) => handleSubMenuClick(e, item)}
                          className="flex justify-between items-center p-4 transition-colors"
                        >
                          <span>{item.name}</span>
                          {item.name === "Institutes" ||
                            item.name === "Courses" ||
                            (item.name === "Exams" && (
                              <ChevronRightIcon className="w-5 h-5" />
                            ))}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            <MobileSubMenu
              handleCloseMobileMenu={handleCloseMobileMenu}
              handleDetailMenuClick={handleDetailMenuClick}
              mobileSubMenu={mobileSubMenu}
              mobileDetailMenu={mobileDetailMenu}
              setMobileSubMenu={setMobileSubMenu}
              isLoading={
                universityMenu?.propertyLoading || courseLoading || examLoading
              }
            />

            <MobileSubMenuSecond
              activeAccordion={activeAccordion}
              setActiveAccordion={setActiveAccordion}
              handleCloseMobileMenu={handleCloseMobileMenu}
              mobileDetailMenu={mobileDetailMenu}
              setMobileDetailMenu={setMobileDetailMenu}
            />
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      )}
      <SettingsOffcanvas
        isOpen={settingOffcanvas}
        onClose={() => setSettingOffcanvas(false)}
        profile={authUser}
      />
    </>
  );
}
