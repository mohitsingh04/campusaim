import { useState } from "react";
import { Link, useLocation } from "react-router";
import { SidbarNavigations } from "../../common/RouteData";
import { UserProps } from "../../types/types";
import { TbMenuDeep } from "react-icons/tb";
import { X } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

interface SidebarProps {
  isCollapsed: boolean;
  authUser: UserProps | null;
}

export function Sidebar({ isCollapsed, authUser }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const { theme } = useTheme();

  const MobileToggle = () => (
    <button
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--yp-primary)] rounded-lg"
    >
      {isMobileOpen ? (
        <X className="w-8 h-8 text-[var(--yp-muted)]" />
      ) : (
        <TbMenuDeep className="w-8 h-8 text-[var(--yp-muted)] rotate-180" />
      )}
    </button>
  );

  const MobileOverlay = () =>
    isMobileOpen && (
      <div
        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsMobileOpen(false)}
      />
    );

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center bg-[var(--yp-primary)] justify-center px-2 py-6 border-b border-[var(--yp-border-primary)] dark:border-gray-700 flex-shrink-0">
        <Link to={`/`}>
          {isCollapsed && !isMobileOpen ? (
            <>
              {theme === "dark" ? (
                <img
                  src="/img/logo/campusaim-small-logo.png"
                  alt="Logo Small Black"
                  className="h-8 w-auto"
                />
              ) : (
                <img
                  src="/img/logo/campusaim-small-logo.png"
                  alt="Logo Small Black"
                  className="h-8 w-auto"
                />
              )}
            </>
          ) : (
            <>
              {theme === "dark" ? (
                <img
                  src="/img/logo/campusaim-logo.png"
                  alt="Logo White"
                  className="h-8 w-auto"
                />
              ) : (
                <img
                  src="/img/logo/campusaim-logo.png"
                  alt="Logo Black"
                  className="h-8 w-auto"
                />
              )}
            </>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar- bg-[var(--yp-primary)]">
        {SidbarNavigations.filter(
          (item) => !item.roles || item.roles.includes(authUser?.role || "")
        ).map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <div key={index}>
              <Link
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                title={item?.name}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
                    : "text-[var(--yp-text-primary)] hover:bg-[var(--yp-tertiary)]"
                } ${isCollapsed && !isMobileOpen ? "justify-center" : ""}`}
              >
                <item.icon
                  className={`w-5 h-5 shrink-0 ${
                    isCollapsed && !isMobileOpen ? "" : "mr-3"
                  }`}
                />
                {(!isCollapsed || isMobileOpen) && item.name}
              </Link>
            </div>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <MobileToggle />
      <MobileOverlay />

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex fixed inset-y-0 left-0 bg-[var(--yp-primary)] border-r border-[var(--yp-border-primary)] transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        } flex-col z-40`}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[var(--yp-primary)] border-r border-[var(--yp-border-primary)] transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        <SidebarContent />
      </div>
    </>
  );
}
