import { getErrorResponse } from "@/context/Callbacks";
import { getProfile } from "@/context/getAssets";
import { UserProps } from "@/types/UserTypes";
import {
  Building,
  GraduationCap,
  HomeIcon,
  LucideIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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
    href,
  }: {
    href: string;
    name: string;
    icon: LucideIcon;
  }) => {
    const isActive = pathname === href;

    return (
      <Link
        href={href}
        title={name}
        className={`flex flex-col items-center justify-center h-full transition-colors relative group 
        ${isActive ? "text-gradient" : "text-(--text-color-emphasis)"}`}
      >
        <div className="w-6 h-6 mb-1">
          <Icon
            className={`${isActive ? "text-(--main)" : "text-(--text-color)"}`}
            size={24}
          />
        </div>
        <span className="text-xs font-medium">{name}</span>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 z-10 w-full h-[72px] bg-(--secondary-bg) sm:hidden">
      <div className="grid grid-cols-5 h-full max-w-md mx-auto">
        <NavItem name="Home" icon={HomeIcon} href="/" />

        <NavItem name="Colleges" icon={Building} href="/colleges" />

        <div className="relative flex items-center justify-center h-full pointer-events-none">
          <button
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search"
            className="pointer-events-auto absolute bottom-[35px] left-1/2 -translate-x-1/2 w-[52px] h-[52px] btn-shine rounded-full text-white flex items-center justify-center shadow-lg transition-colors ring-4 ring-white"
          >
            <SearchIcon size={28} />
          </button>
        </div>

        <NavItem name="Courses" icon={GraduationCap} href="/courses" />

        {!loading && profile ? (
          <NavItem name="Profile" icon={UserIcon} href="/profile" />
        ) : (
          <NavItem name="Profile" icon={UserIcon} href="/auth/login" />
        )}
      </div>
    </div>
  );
};
