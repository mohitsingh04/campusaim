import { getErrorResponse } from "@/context/Callbacks";
import { getProfile } from "@/context/getAssets";
import { UserProps } from "@/types/UserTypes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IconType } from "react-icons";
import { BiSolidUser, BiUser } from "react-icons/bi";
import {
  FaBuilding,
  FaGraduationCap,
  FaHome,
  FaRegBuilding,
} from "react-icons/fa";
import { IoHomeOutline } from "react-icons/io5";
import { LiaGraduationCapSolid } from "react-icons/lia";
import { LuSearch } from "react-icons/lu";

export const BottomNavBar = ({ setIsSearchOpen }: { setIsSearchOpen: any }) => {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  const getProfileUser = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      getErrorResponse(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProfileUser();
  }, [getProfileUser]);

  const NavItem = ({
    name,
    icon: Icon,
    activeIcon: ActiveIcon,
    href,
  }: {
    href: string;
    name: string;
    icon: IconType;
    activeIcon: IconType;
  }) => {
    const isActive = pathname === href;

    return (
      <Link
        href={href}
        className={`flex flex-col items-center justify-center h-full transition-colors relative group 
        ${isActive ? "text-(--main)" : "text-(--text-color-emphasis)"}`}
      >
        <div className="w-6 h-6 mb-1">
          {isActive ? <ActiveIcon size={24} /> : <Icon size={24} />}
        </div>
        <span className="text-xs font-medium">{name}</span>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 z-10 w-full h-[72px] bg-(--secondary-bg) sm:hidden">
      <div className="grid grid-cols-5 h-full max-w-md mx-auto">
        <NavItem
          name="Home"
          icon={IoHomeOutline}
          activeIcon={FaHome}
          href="/"
        />

        <NavItem
          name="Institutes"
          icon={FaRegBuilding}
          activeIcon={FaBuilding}
          href="/yoga-institutes"
        />

        <div className="relative flex items-center justify-center h-full pointer-events-none">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="pointer-events-auto absolute bottom-[35px] left-1/2 -translate-x-1/2 w-[52px] h-[52px] bg-(--main) rounded-full text-white flex items-center justify-center shadow-lg transition-colors ring-4 ring-white"
          >
            <LuSearch size={28} />
          </button>
        </div>

        <NavItem
          name="Courses"
          icon={LiaGraduationCapSolid}
          activeIcon={FaGraduationCap}
          href="/courses"
        />

        {!loading && profile ? (
          <NavItem
            name="Profile"
            icon={BiUser}
            activeIcon={BiSolidUser}
            href="/profile"
          />
        ) : (
          <NavItem
            name="Profile"
            icon={BiUser}
            activeIcon={BiSolidUser}
            href="/auth/login"
          />
        )}
      </div>
    </div>
  );
};
