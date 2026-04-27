import { getUserAvatar } from "@/context/Callbacks";
import { handleLogout } from "@/context/getAssets";
import { UserProps } from "@/types/UserTypes";
import { LogOutIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ProfileButtonProps {
  authUser: UserProps | null;
  token: string;
  setSettingOffcanvas: React.Dispatch<React.SetStateAction<boolean>>;
  handleCloseMobileMenu?: () => void;
  isMobile?: boolean;
}

export default function ProfileButton({
  authUser,
  token,
  setSettingOffcanvas,
  isMobile,
  handleCloseMobileMenu,
}: ProfileButtonProps) {
  const LoginButton = () => (
    <Link
      href="/auth/login"
      title="Login"
      onClick={handleCloseMobileMenu}
      className="flex items-center justify-center px-5 py-2.5 rounded-custom bg-(--main) text-white font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
    >
      Login
    </Link>
  );

  if (isMobile) {
    if (!token) return <LoginButton />;

    return (
      <div className="flex items-center p-3">
        <Link
          href="/profile"
          title="Profile"
          onClick={handleCloseMobileMenu}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="relative w-11 h-11 shrink-0">
            <Image
              src={getUserAvatar(authUser?.avatar || [])}
              alt="Avatar"
              fill
              sizes="44px"
              className="rounded-full border-2 border-(--main-subtle) object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-(--main-subtle) truncate">
              {authUser?.username || "User"}
            </span>
            <span className="text-xs text-(--main-subtle) opacity-70 truncate">
              View Profile
            </span>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="p-2.5 ml-2 rounded-lg bg-(--danger-subtle) text-(--danger) transition-colors"
          aria-label="Logout"
        >
          <LogOutIcon size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {!token ? (
        <LoginButton />
      ) : (
        <button
          onClick={() => setSettingOffcanvas(true)}
          className="group flex items-center gap-2.5 bg-(--secondary-bg) hover:bg-(--main-subtle) px-3 py-1.5 rounded-custom transition-all"
        >
          <div className="relative w-7 h-7 overflow-hidden rounded-full">
            <Image
              src={getUserAvatar(authUser?.avatar || [])}
              alt={authUser?.username || "User"}
              fill
              sizes="28px"
              className="object-cover"
            />
          </div>
          <span className="text-sm font-semibold text-(--text-color-emphasis) max-w-25 truncate">
            {authUser?.username}
          </span>
        </button>
      )}
    </div>
  );
}
