// src/components/header/ProfileDropdown.tsx
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom"; // fixed import
import { ChevronDown, LucideIcon } from "lucide-react";

interface DropdownItemBase {
  label: string;
  icon?: LucideIcon;
}

interface DropdownLink extends DropdownItemBase {
  type: "link";
  to: string;
}

interface DropdownButton extends DropdownItemBase {
  type: "button";
  onClick: () => void;
  danger?: boolean;
}

type DropdownItem = DropdownLink | DropdownButton;

interface ProfileDropdownProps {
  username: string | undefined;
  avatarUrl: string;
  items: DropdownItem[];
}

export function ProfileDropdown({
  username,
  avatarUrl,
  items,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 p-2 text-[var(--yp-text-primary)] hover:bg-[var(--yp-tertiary)] rounded-lg transition-colors"
      >
        <img
          src={avatarUrl}
          alt={username}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="hidden sm:block text-sm font-medium">{username}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        // Added "fixed" to avoid clipping, keep right aligned
        <div className="fixed right-4 mt-2 w-48 bg-[var(--yp-tertiary)] rounded-lg shadow-lg z-[9999]">
          <div className="p-2">
            {items.map((item, idx) =>
              item.type === "link" ? (
                <Link
                  key={idx}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center px-3 py-2 text-sm text-[var(--yp-text-primary)] hover:bg-[var(--yp-secondary)] rounded-md transition-colors"
                >
                  {item.icon && <item.icon className="w-4 h-4 mr-3" />}
                  {item.label}
                </Link>
              ) : (
                <button
                  key={idx}
                  onClick={() => {
                    item.onClick();
                    setOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors  text-[var(--yp-text-primary)] ${
                    item.danger
                      ? "hover:bg-[var(--yp-red-bg)] hover:text-[var(--yp-red-text)]"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4 mr-3" />}
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
