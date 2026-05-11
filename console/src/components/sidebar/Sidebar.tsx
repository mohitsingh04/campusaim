import { useState } from "react";
import { Link, useLocation } from "react-router";
import { SidbarNavigations } from "../../common/RouteData";
import { UserProps } from "../../types/types";
import { TbMenuDeep } from "react-icons/tb";
import { ChevronDown, ChevronRight, X } from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  authUser: UserProps | null;
}

export function Sidebar({ isCollapsed, authUser }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const location = useLocation();
  const pathname = location.pathname;

  const [openMenus, setOpenMenus] = useState<string[]>(
    SidbarNavigations.filter((item) =>
      item?.submenu?.some((sub: any) => pathname === sub.href),
    ).map((item) => item.name),
  );

  const toggleSubmenu = (menuName: string) => {
    setOpenMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((item) => item !== menuName)
        : [...prev, menuName],
    );
  };

  const isMenuOpen = (menuName: string) => {
    return openMenus.includes(menuName);
  };

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
        className="lg:hidden fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsMobileOpen(false)}
      />
    );

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center bg-[var(--yp-primary)] justify-center px-2 py-6 border-b border-[var(--yp-border-primary)] dark:border-gray-700 flex-shrink-0">
        <Link to="/dashboard">
          {isCollapsed && !isMobileOpen ? (
            <img
              src="/img/logo/campusaim-small-logo.png"
              alt="Logo Small"
              className="h-8 w-auto"
            />
          ) : (
            <img
              src="/img/logo/campusaim-logo.png"
              alt="Logo"
              className="h-8 w-auto"
            />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto bg-[var(--yp-primary)]">
        {SidbarNavigations.filter(
          (item) => !item.roles || item.roles.includes(authUser?.role || ""),
        ).map((item, index) => {
          const hasSubmenu = item.submenu && item.submenu.length > 0;

          const isParentActive = hasSubmenu
            ? item.submenu.some((sub: any) => pathname === sub.href)
            : pathname === item.href;

          return (
            <div key={index}>
              {/* Parent Menu */}
              {hasSubmenu ? (
                <>
                  <button
                    type="button"
                    onClick={() => toggleSubmenu(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isParentActive
                        ? "bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
                        : "text-[var(--yp-text-primary)] hover:bg-[var(--yp-tertiary)]"
                    }`}
                  >
                    <div
                      className={`flex items-center ${
                        isCollapsed && !isMobileOpen
                          ? "justify-center w-full"
                          : ""
                      }`}
                    >
                      <item.icon
                        className={`w-5 h-5 shrink-0 ${
                          isCollapsed && !isMobileOpen ? "" : "mr-3"
                        }`}
                      />

                      {(!isCollapsed || isMobileOpen) && (
                        <span>{item.name}</span>
                      )}
                    </div>

                    {(!isCollapsed || isMobileOpen) && (
                      <>
                        {isMenuOpen(item.name) ? (
                          <ChevronDown className="w-4 h-4 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 shrink-0" />
                        )}
                      </>
                    )}
                  </button>

                  {/* Submenu */}
                  {isMenuOpen(item.name) && (!isCollapsed || isMobileOpen) && (
                    <div className="mt-1 ml-3 space-y-1 border-l border-[var(--yp-border-primary)] pl-3">
                      {item.submenu
                        .filter(
                          (sub: any) =>
                            !sub.roles ||
                            sub.roles.includes(authUser?.role || ""),
                        )
                        .map((sub: any, subIndex: number) => {
                          const isSubActive = pathname === sub.href;

                          return (
                            <Link
                              key={subIndex}
                              to={sub.href}
                              onClick={() => setIsMobileOpen(false)}
                              className={`group flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                isSubActive
                                  ? "bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
                                  : "text-[var(--yp-text-primary)] hover:bg-[var(--yp-tertiary)]"
                              }`}
                            >
                              {/* Dot */}
                              <span
                                className={`w-2 h-2 rounded-full mr-3 shrink-0 ${
                                  isSubActive
                                    ? "bg-[var(--yp-blue-text)]"
                                    : "bg-[var(--yp-text-secondary)] group-hover:bg-[var(--yp-text-primary)]"
                                }`}
                              />

                              {sub.icon && (
                                <sub.icon className="w-4 h-4 mr-2 shrink-0" />
                              )}

                              <span className="truncate">{sub.name}</span>
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  title={item.name}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
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
              )}
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
