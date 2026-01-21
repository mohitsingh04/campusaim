import API from "@/context/API";
import { getErrorResponse, getUserAvatar } from "@/context/Callbacks";
import { handleLogout } from "@/context/getAssets";
import { useTheme } from "@/hooks/useTheme";
import { UserProps } from "@/types/UserTypes";
import Badge from "@/ui/badge/Badge";
import ToggleButton from "@/ui/buttons/ToggleButton";
import HeadingLine from "@/ui/headings/HeadingLine";
import SidebarSkeleton from "@/ui/loader/page/blog/_components/SidebarSkeleton";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, ReactNode, useCallback } from "react";
import { createPortal } from "react-dom";
import { IconType } from "react-icons";
import { BiBriefcase, BiLogOut, BiMoon } from "react-icons/bi";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FiChevronRight, FiCreditCard, FiShield, FiX } from "react-icons/fi";

type SettingsItemType = {
  icon?: IconType;
  label: string;
  subLabel?: string;
  href?: string;
  external?: boolean;
  custom?: ReactNode;
  hide: boolean;
};

export default function SettingsOffcanvas({
  isOpen,
  onClose,
  profile,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProps | null;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [roles, setRoles] = useState<{ role: string; _id: string }[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  const getRoles = useCallback(async () => {
    try {
      const response = await API.get("/profile/role");
      setRoles(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  useEffect(() => {
    getRoles();
  }, [getRoles]);

  const getRoleById = useCallback(
    (id: string) => {
      const rol = roles?.find((item) => item._id === id);
      return rol?.role;
    },
    [roles]
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const accountItems: SettingsItemType[] = [
    {
      icon: FiCreditCard,
      label: "Account Center",
      subLabel: "Manage Your Profile Account",
      href: "/settings/account",
      hide: false,
    },
  ];

  const exploreItems: SettingsItemType[] = [
    {
      icon: FaRegQuestionCircle,
      label: "Ask (Community)",
      subLabel: "Questions & Answer Community",
      href: process.env.NEXT_PUBLIC_ASK_URL!,
      external: true,
      hide: false,
    },
    {
      icon: FiShield,
      label: "Console",
      subLabel: "Manage Your Property",
      href: process.env.NEXT_PUBLIC_DASHBOARD_URL!,
      external: true,
      hide: getRoleById(profile?.role || "") !== "User" ? false : true,
    },
    {
      icon: BiBriefcase,
      label: "Career",
      subLabel: "Get Trending Jobs Here",
      href: process.env.NEXT_PUBLIC_CAREER_URL!,
      external: true,
      hide: false,
    },
  ];

  const settingsItems: SettingsItemType[] = [
    {
      icon: BiMoon,
      label: "Dark Mode",
      custom: (
        <ToggleButton
          checked={theme === "dark"}
          onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      ),
      hide: false,
    },
    // {
    //   icon: FiSmartphone,
    //   label: "Privacy Data Center",
    //   subLabel: "Your Privacy and Data Center",
    //   href: "/privacy-data-center",
    //   hide: false,
    // },
  ];

  if (loadingRoles) return <SidebarSkeleton />;

  const content = (
    <div
      className={`fixed inset-0 z-100 flex justify-end transition-all duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-sm h-full bg-(--primary-bg)
        border-l border-(--border) shadow-2xl
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        flex flex-col`}
      >
        <div className="flex justify-between items-start border-b border-(--border)">
          <div className="px-4 py-4 flex items-center gap-4">
            <Link href="/profile" onClick={onClose}>
              <div className="w-12 h-12 relative rounded-full overflow-hidden border border-(--border)">
                <Image
                  src={getUserAvatar(profile?.avatar || [])}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            </Link>

            <div>
              <Link href="/profile" onClick={onClose}>
                <h3 className="text-sm font-bold text-(--text-color-emphasis)">
                  {profile?.name}
                </h3>
                <p className="text-xs text-(--text-color)">
                  @{profile?.username}
                </p>
              </Link>
              <div className="flex gap-2 mt-2">
                <Badge label={getRoleById(profile?.role || "")} />
                <Badge
                  label={profile?.isProfessional ? "Professional" : "User"}
                />
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-3 text-(--text-color) ">
            <FiX size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <Section
            title="Your Account"
            items={accountItems}
            onClose={onClose}
          />
          <Section
            title="Explore Yogprerna"
            items={exploreItems}
            onClose={onClose}
          />
          <Section title="Settings" items={settingsItems} onClose={onClose} />
        </div>

        <div className="p-3 border-t border-(--border)">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl
            bg-(--danger-subtle) text-(--danger-emphasis) font-semibold"
          >
            <BiLogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

function Section({
  title,
  items,
  onClose,
}: {
  title: string;
  items: SettingsItemType[];
  onClose: () => void;
}) {
  const visibleItems = items.filter((item) => !item.hide);

  if (visibleItems.length === 0) return null;

  return (
    <div>
      <HeadingLine title={title} />
      <div className="space-y-1">
        {visibleItems.map((item, index) =>
          item.custom ? (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-2 rounded-xl hover:bg-(--secondary-bg)"
            >
              <div className="flex items-center gap-4">
                {item.icon && <IconBox icon={item.icon} />}
                <span className="text-sm font-semibold text-(--text-color-emphasis)">
                  {item.label}
                </span>
              </div>
              {item.custom}
            </div>
          ) : (
            <SettingsLink key={index} {...item} onClose={onClose} />
          )
        )}
      </div>
    </div>
  );
}

function SettingsLink({
  icon,
  label,
  subLabel,
  href = "#",
  external,
  onClose,
}: SettingsItemType & { onClose: () => void }) {
  const Icon = icon;

  return (
    <Link
      href={href}
      onClick={onClose}
      target={external ? "_blank" : "_self"}
      className="flex items-center justify-between py-2 px-2 rounded-xl hover:bg-(--secondary-bg) group"
    >
      <div className="flex items-center gap-4">
        {Icon && <IconBox icon={Icon} />}
        <div>
          <p className="text-sm font-semibold text-(--text-color-emphasis)">
            {label}
          </p>
          {subLabel && (
            <p className="text-xs text-(--text-color)">{subLabel}</p>
          )}
        </div>
      </div>
      <FiChevronRight className="opacity-50 group-hover:translate-x-1 transition-all text-(--main)" />
    </Link>
  );
}

function IconBox({ icon: Icon }: { icon: IconType }) {
  return (
    <div className="p-2.5 bg-(--main-light) text-(--main-emphasis) rounded-lg">
      <Icon size={18} />
    </div>
  );
}
